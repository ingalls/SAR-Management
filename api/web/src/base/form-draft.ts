import { ref, watch, onBeforeUnmount } from 'vue';
import type { Ref } from 'vue';

const MAX_AGE = 14 * 24 * 60 * 60 * 1000;
const DEBOUNCE = 400;

interface StoredDraft {
    saved: number;
    data: string;
}

export interface FormDraft {
    // Timestamp the restored draft was saved at, null if the form was not restored
    restored: Ref<number | null>;
    // Snapshot the pristine form and apply a stored draft, returns true if one was applied
    begin: () => boolean;
    // Called on the first user interaction, changes made before it are not treated as edits
    arm: () => void;
    // Drop the draft and return the form to its pristine values
    discard: () => void;
    // Drop the draft once the form has been saved
    clear: () => void;
}

/**
 * Persist unsaved form values to localStorage so they survive a refresh,
 * a failed save or an accidental navigation
 *
 * @param key   Storage key, unique per form & record
 * @param read  Return the JSON serialisable form values
 * @param write Apply previously saved form values
 */
export function useFormDraft<T>(
    key: () => string,
    read: () => T,
    write: (data: T) => void
): FormDraft {
    const restored = ref<number | null>(null);

    let pristine = '';
    let clean = '';
    let armed = false;
    let done = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    function remove(): void {
        try {
            localStorage.removeItem(key());
        } catch {
            // Storage is unavailable in private windows
        }
    }

    function load(): StoredDraft | null {
        try {
            const raw = localStorage.getItem(key());
            if (!raw) return null;

            const stored = JSON.parse(raw) as StoredDraft;
            if (typeof stored.saved !== 'number' || typeof stored.data !== 'string') return null;
            if (Date.now() - stored.saved > MAX_AGE) return null;

            JSON.parse(stored.data);
            return stored;
        } catch {
            return null;
        }
    }

    function save(): void {
        clearTimeout(timer);
        timer = undefined;
        if (!armed || done) return;

        const data = JSON.stringify(read());

        if (data === clean) {
            remove();
            return;
        }

        try {
            localStorage.setItem(key(), JSON.stringify({ saved: Date.now(), data }));
        } catch {
            // Storage is full or unavailable, the form still works without a draft
        }
    }

    function flush(): void {
        if (timer !== undefined) save();
    }

    function begin(): boolean {
        pristine = JSON.stringify(read());
        clean = pristine;
        armed = false;
        done = false;

        const stored = load();
        if (!stored || stored.data === pristine) {
            remove();
            restored.value = null;
            return false;
        }

        write(JSON.parse(stored.data) as T);
        restored.value = stored.saved;
        armed = true;
        return true;
    }

    function arm(): void {
        if (armed || done) return;
        clean = JSON.stringify(read());
        armed = true;
    }

    function discard(): void {
        clearTimeout(timer);
        timer = undefined;
        remove();
        restored.value = null;
        armed = false;
        if (pristine) write(JSON.parse(pristine) as T);
    }

    function clear(): void {
        clearTimeout(timer);
        timer = undefined;
        done = true;
        restored.value = null;
        remove();
    }

    watch(() => JSON.stringify(read()), () => {
        if (!armed || done) return;
        clearTimeout(timer);
        timer = setTimeout(save, DEBOUNCE);
    });

    window.addEventListener('pagehide', flush);

    onBeforeUnmount(() => {
        flush();
        window.removeEventListener('pagehide', flush);
    });

    return { restored, begin, arm, discard, clear };
}
