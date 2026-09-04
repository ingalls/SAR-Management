import { ref, reactive, watch, onMounted } from 'vue';

function isTrue(value) {
    return value === true || value === 'true';
}

/**
 * Shared fetch/save state for a single Server Settings section.
 *
 * Each section owns a small set of config keys which are only loaded once the
 * section is expanded and are written back together on save.
 *
 * @param {Object} opts
 * @param {Object} opts.defaults   Map of config key => default value. Boolean
 *                                 defaults are parsed from the "true"/"false"
 *                                 strings the server stores.
 * @param {String[]} [opts.public] Keys readable without authentication
 * @param {String[]} [opts.readonly] Keys fetched for display but never saved
 * @param {Function} [opts.onSaved] Called after a successful save
 */
export function useConfig(opts) {
    const defaults = opts.defaults;
    const publicKeys = new Set(opts.public || []);
    const readonlyKeys = new Set(opts.readonly || []);

    const isOpen = ref(false);
    const loading = ref(false);
    const edit = ref(false);
    const err = ref(null);

    const config = reactive({ ...defaults });

    function normalize(key, raw) {
        if (raw === '' || raw === null || raw === undefined) return defaults[key];
        if (typeof defaults[key] === 'boolean') return isTrue(raw);
        return raw;
    }

    async function fetch() {
        loading.value = true;
        err.value = null;

        try {
            const keys = Object.keys(defaults).join(',');
            const result = await window.std(`/api/config?keys=${keys}`);

            for (const key of Object.keys(defaults)) {
                config[key] = normalize(key, result.config[key] ? result.config[key].value : undefined);
            }
        } catch (error) {
            err.value = error instanceof Error ? error : new Error(String(error));
        }

        loading.value = false;
    }

    async function save() {
        loading.value = true;
        err.value = null;

        try {
            const updates = {};
            for (const key of Object.keys(defaults)) {
                if (readonlyKeys.has(key)) continue;

                updates[key] = {
                    value: config[key],
                    public: publicKeys.has(key)
                };
            }

            await window.std('/api/config', {
                method: 'PUT',
                body: { config: updates }
            });

            edit.value = false;

            if (opts.onSaved) await opts.onSaved(config);
        } catch (error) {
            err.value = error instanceof Error ? error : new Error(String(error));
            console.error('Failed to save config:', error);
        }

        loading.value = false;
    }

    function cancel() {
        edit.value = false;
        fetch();
    }

    onMounted(() => {
        if (isOpen.value) fetch();
    });

    watch(isOpen, (open) => {
        if (open && !edit.value) fetch();
    });

    return { isOpen, loading, edit, err, config, fetch, save, cancel };
}
