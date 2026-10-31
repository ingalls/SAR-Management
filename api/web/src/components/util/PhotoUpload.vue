<template>
    <TablerModal
        size='md'
        :dismissable='!uploading'
        @close='$emit("close")'
    >
        <button
            type='button'
            class='btn-close'
            aria-label='Close'
            :disabled='uploading'
            @click='$emit("close")'
        />
        <div class='modal-status bg-primary' />
        <div class='modal-header'>
            <h5
                class='modal-title'
                v-text='title'
            />
        </div>

        <div class='modal-body'>
            <TablerAlert
                v-if='error'
                :err='error'
            />

            <template v-if='!image'>
                <div
                    class='photo-drop'
                    :class='{ "photo-drop--over": dragover }'
                    role='button'
                    tabindex='0'
                    @click='fileInput.click()'
                    @keydown.enter.prevent='fileInput.click()'
                    @dragover.prevent='dragover = true'
                    @dragleave='dragover = false'
                    @drop.prevent='onDrop'
                >
                    <IconPhotoUp
                        :size='40'
                        :stroke='1.25'
                    />
                    <div class='mt-2 fw-medium'>
                        Choose a photo
                    </div>
                    <div class='text-secondary small'>
                        Drag and drop or tap to browse
                    </div>
                </div>
                <input
                    ref='fileInput'
                    class='d-none'
                    type='file'
                    accept='image/*'
                    @change='onFileInput'
                >
            </template>

            <template v-else>
                <div
                    ref='frame'
                    class='photo-crop'
                    :class='{ "photo-crop--grabbing": dragging }'
                    :style='{ aspectRatio: String(aspect) }'
                    @pointerdown='onPointerDown'
                    @pointermove='onPointerMove'
                    @pointerup='onPointerUp'
                    @pointercancel='onPointerUp'
                    @wheel.prevent='onWheel'
                >
                    <img
                        :src='image.src'
                        class='photo-crop__img'
                        :style='imageStyle'
                        alt=''
                        draggable='false'
                    >
                    <div
                        class='photo-crop__mask'
                        :class='{ "photo-crop__mask--round": round }'
                    />
                </div>

                <div class='photo-tools'>
                    <TablerIconButton
                        title='Zoom Out'
                        @click='zoomBy(-0.1)'
                    >
                        <IconZoomOut
                            :size='22'
                            :stroke='1.5'
                        />
                    </TablerIconButton>
                    <input
                        v-model.number='zoom'
                        type='range'
                        class='form-range photo-tools__zoom'
                        :min='1'
                        :max='MAX_ZOOM'
                        :step='0.01'
                        aria-label='Zoom'
                        @input='clamp'
                    >
                    <TablerIconButton
                        title='Zoom In'
                        @click='zoomBy(0.1)'
                    >
                        <IconZoomIn
                            :size='22'
                            :stroke='1.5'
                        />
                    </TablerIconButton>
                    <div class='vr mx-1' />
                    <TablerIconButton
                        title='Rotate Left'
                        @click='rotate(-90)'
                    >
                        <IconRotate2
                            :size='22'
                            :stroke='1.5'
                        />
                    </TablerIconButton>
                    <TablerIconButton
                        title='Rotate Right'
                        @click='rotate(90)'
                    >
                        <IconRotateClockwise2
                            :size='22'
                            :stroke='1.5'
                        />
                    </TablerIconButton>
                </div>

                <div class='text-secondary small text-center'>
                    Drag to reposition. Pinch or scroll to zoom.
                </div>
            </template>
        </div>

        <div class='modal-footer'>
            <button
                v-if='image'
                type='button'
                class='btn btn-link text-secondary me-auto'
                :disabled='uploading'
                @click='reset'
            >
                Choose different photo
            </button>
            <button
                type='button'
                class='btn'
                :disabled='uploading'
                @click='$emit("close")'
            >
                Cancel
            </button>
            <button
                type='button'
                class='btn btn-primary'
                :disabled='!image || uploading'
                @click='save'
            >
                <span
                    v-if='uploading'
                    class='spinner-border spinner-border-sm me-2'
                />
                <IconCheck
                    v-else
                    class='me-1'
                    :size='18'
                    :stroke='1.5'
                />
                Save Photo
            </button>
        </div>
    </TablerModal>
</template>

<script setup>
import { ref, computed, watch, onBeforeUnmount } from 'vue';
import {
    TablerModal,
    TablerAlert,
    TablerIconButton
} from '@tak-ps/vue-tabler';
import {
    IconPhotoUp,
    IconZoomIn,
    IconZoomOut,
    IconRotate2,
    IconRotateClockwise2,
    IconCheck
} from '@tabler/icons-vue';

const props = defineProps({
    url: {
        type: [String, URL],
        required: true
    },
    headers: {
        type: Object,
        default: () => ({})
    },
    title: {
        type: String,
        default: 'Update Photo'
    },
    aspect: {
        type: Number,
        default: 1
    },
    round: {
        type: Boolean,
        default: false
    },
    size: {
        type: Number,
        default: 1024
    },
    filename: {
        type: String,
        default: 'photo.jpg'
    }
});

const emit = defineEmits(['done', 'close']);

const MAX_ZOOM = 4;

const fileInput = ref(null);
const frame = ref(null);
const dragover = ref(false);
const error = ref(null);
const uploading = ref(false);

const image = ref(null);
const zoom = ref(1);
const rotation = ref(0);
const offset = ref({ x: 0, y: 0 });
const dragging = ref(false);
const pointers = new Map();
let pinch = null;

const rotated = computed(() => rotation.value % 180 !== 0);
const natural = computed(() => {
    if (!image.value) return { w: 1, h: 1 };
    return rotated.value
        ? { w: image.value.naturalHeight, h: image.value.naturalWidth }
        : { w: image.value.naturalWidth, h: image.value.naturalHeight };
});

const frameRect = ref({ w: 1, h: 1 });
const frameSize = () => frameRect.value;

let observer = null;
watch(frame, (el) => {
    if (observer) observer.disconnect();
    if (!el) return;
    observer = new ResizeObserver(() => {
        frameRect.value = { w: el.clientWidth, h: el.clientHeight };
        clamp();
    });
    observer.observe(el);
});
onBeforeUnmount(() => {
    if (observer) observer.disconnect();
    if (image.value) URL.revokeObjectURL(image.value.src);
});

const coverScale = () => {
    const f = frameSize();
    return Math.max(f.w / natural.value.w, f.h / natural.value.h);
};

const scale = computed(() => coverScale() * zoom.value);

const imageStyle = computed(() => {
    if (!image.value) return {};
    const s = scale.value;
    return {
        width: `${image.value.naturalWidth * s}px`,
        height: `${image.value.naturalHeight * s}px`,
        transform: `translate(-50%, -50%) translate(${offset.value.x}px, ${offset.value.y}px) rotate(${rotation.value}deg)`
    };
});

function clamp() {
    if (!image.value) return;
    const f = frameSize();
    const s = scale.value;
    const maxX = Math.max(0, (natural.value.w * s - f.w) / 2);
    const maxY = Math.max(0, (natural.value.h * s - f.h) / 2);
    zoom.value = Math.min(MAX_ZOOM, Math.max(1, zoom.value));
    offset.value = {
        x: Math.min(maxX, Math.max(-maxX, offset.value.x)),
        y: Math.min(maxY, Math.max(-maxY, offset.value.y))
    };
}

function zoomBy(delta) {
    zoom.value = Math.min(MAX_ZOOM, Math.max(1, zoom.value + delta));
    clamp();
}

function rotate(deg) {
    rotation.value = (rotation.value + deg + 360) % 360;
    offset.value = { x: offset.value.y * Math.sign(deg) * -1, y: offset.value.x * Math.sign(deg) };
    clamp();
}

function onWheel(event) {
    zoomBy(event.deltaY < 0 ? 0.1 : -0.1);
}

function onPointerDown(event) {
    frame.value.setPointerCapture(event.pointerId);
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.size === 2) {
        const [a, b] = [...pointers.values()];
        pinch = { dist: Math.hypot(a.x - b.x, a.y - b.y), zoom: zoom.value };
    } else {
        dragging.value = true;
    }
}

function onPointerMove(event) {
    const prev = pointers.get(event.pointerId);
    if (!prev) return;
    const cur = { x: event.clientX, y: event.clientY };
    pointers.set(event.pointerId, cur);

    if (pointers.size === 2 && pinch) {
        const [a, b] = [...pointers.values()];
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        zoom.value = pinch.zoom * (dist / pinch.dist);
    } else if (pointers.size === 1) {
        offset.value = {
            x: offset.value.x + cur.x - prev.x,
            y: offset.value.y + cur.y - prev.y
        };
    }
    clamp();
}

function onPointerUp(event) {
    pointers.delete(event.pointerId);
    if (pointers.size < 2) pinch = null;
    if (pointers.size === 0) dragging.value = false;
}

function reset() {
    if (image.value) URL.revokeObjectURL(image.value.src);
    image.value = null;
    zoom.value = 1;
    rotation.value = 0;
    offset.value = { x: 0, y: 0 };
    error.value = null;
}

function load(file) {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
        error.value = new Error('Please choose an image file');
        return;
    }

    reset();

    const img = new Image();
    img.onload = () => { image.value = img; };
    img.onerror = () => {
        URL.revokeObjectURL(img.src);
        error.value = new Error('Could not read that image');
    };
    img.src = URL.createObjectURL(file);
}

function onFileInput(event) {
    load(event.target.files[0]);
    event.target.value = '';
}

function onDrop(event) {
    dragover.value = false;
    load(event.dataTransfer.files[0]);
}

function render() {
    const f = frameSize();
    const outW = props.size;
    const outH = Math.round(props.size / props.aspect);
    const ratio = outW / f.w;

    const canvas = document.createElement('canvas');
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, outW, outH);

    ctx.translate(outW / 2 + offset.value.x * ratio, outH / 2 + offset.value.y * ratio);
    ctx.rotate(rotation.value * Math.PI / 180);
    const s = scale.value * ratio;
    const w = image.value.naturalWidth * s;
    const h = image.value.naturalHeight * s;
    ctx.drawImage(image.value, -w / 2, -h / 2, w, h);

    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Could not process image'));
        }, 'image/jpeg', 0.92);
    });
}

async function save() {
    uploading.value = true;
    error.value = null;

    try {
        const blob = await render();
        const body = new FormData();
        body.append('file', blob, props.filename);

        const res = await fetch(props.url, {
            method: 'POST',
            headers: props.headers,
            body
        });

        if (!res.ok) {
            let message = 'Failed to upload photo';
            try {
                message = (await res.json()).message || message;
            } catch {
                // keep the generic message
            }
            throw new Error(message);
        }

        emit('done', await res.json());
    } catch (err) {
        error.value = err;
    } finally {
        uploading.value = false;
    }
}

</script>

<style>
.photo-drop {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 220px;
    padding: 1.5rem;
    border: 2px dashed var(--tblr-border-color);
    border-radius: var(--tblr-border-radius-lg);
    color: var(--tblr-secondary-color);
    cursor: pointer;
    text-align: center;
    transition: border-color 0.15s ease, background 0.15s ease;
}

.photo-drop:hover,
.photo-drop:focus-visible,
.photo-drop--over {
    border-color: var(--tblr-primary);
    background: rgba(var(--tblr-primary-rgb), 0.04);
    color: var(--tblr-body-color);
    outline: none;
}

.photo-crop {
    position: relative;
    width: min(100%, 60vh);
    margin: 0 auto;
    overflow: hidden;
    border-radius: var(--tblr-border-radius-lg);
    background: #111;
    cursor: grab;
    touch-action: none;
    user-select: none;
}

.photo-crop--grabbing {
    cursor: grabbing;
}

.photo-crop__img {
    position: absolute;
    top: 50%;
    left: 50%;
    max-width: none;
    pointer-events: none;
}

.photo-crop__mask {
    position: absolute;
    inset: 0;
    pointer-events: none;
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.35);
}

.photo-crop__mask--round {
    border-radius: 50%;
    box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.55), inset 0 0 0 1px rgba(255, 255, 255, 0.5);
}

.photo-tools {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    margin: 0.75rem 0 0.25rem;
}

.photo-tools__zoom {
    flex: 1;
    min-width: 0;
}
</style>
