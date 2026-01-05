<script setup lang="ts">
import { computed, onMounted, ref, h, onBeforeMount } from 'vue';
import MarkdownIt from 'markdown-it';
import { tooltips, type TooltipEntry } from '../tooltips';

const props = withDefaults(
  defineProps<{
    tooltipKey: string;
    title?: string;
    icon?: string;
  }>(),
  {
    icon: "i-ri-information-2-line",
  },
);

const md = new MarkdownIt();
const tooltipData = ref<TooltipEntry | null>(null);
const isMounted = ref(false);

// Fetch tooltip data
const fetchTooltipData = () => {
  tooltipData.value = tooltips[props.tooltipKey] || null;
};

// Computed property for the tooltip title
const tooltipTitle = computed<string>(() => {
  if (props.title) return props.title;
  if (tooltipData.value?.title) return tooltipData.value.title;
  return 'Info';
});

// Computed property for the HTML content of the tooltip
const tooltipHtmlContent = computed<string>(() => {
  if (!isMounted.value) return '';
  if (tooltipData.value?.content) {
    return md.render(tooltipData.value.content);
  }
  return `<p>Tooltip content not found for key: <code>${props.tooltipKey}</code></p>`;
});

// Initialize tooltip data when component mounts
onBeforeMount(() => {
  fetchTooltipData();
  isMounted.value = true;
});
</script>

<template>
  <span class="inline-flex items-center touch-manipulation">
    <button
      v-tooltip="{
        html: true,
        content: `
          <div class='p-4 max-w-lg border-[var(--sl-color-border)] bg-[var(--sl-color-bg-inset)] rounded-lg border-2 border-solid shadow-lg'>
            <h3 class='text-lg font-semibold text-[var(--sl-color-text-1)] mb-2'>${tooltipTitle}</h3>
            <div class='tooltip-markdown-content text-sm text-[var(--sl-color-text-2)] prose'>${tooltipHtmlContent}</div>
          </div>
        `,
        placement: 'top',
        distance: 10,
        arrowPadding: 8,
        flip: true,
        shift: true,
        boundary: 'viewport',
        theme: 'info-tooltip',
        // Let the global config handle triggers based on device
      }"
      type="button"
      class="w-7 h-7 rounded-full bg-[var(--sl-color-accent-low)] hover:bg-[var(--sl-color-accent-low)]/40 active:bg-[var(--sl-color-accent-low)]/60 text-[var(--sl-color-text-accent)] border-[var(--sl-color-accent-low)] hover:border-[var(--sl-color-accent-high)] select-none border-2 border-solid font-bold transition-all duration-300 flex items-center justify-center touch-manipulation"
      :aria-label="tooltipTitle"
      @click.prevent
    >
      <span :class="icon" class="text-base" />
    </button>
  </span>
</template>

<style>
/* Tooltip styles */
.v-popper__popper {
  z-index: 9999 !important;
}

.v-popper--theme-info-tooltip .v-popper__inner {
  background: var(--sl-color-bg);
  color: var(--sl-color-text);
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  max-width: 24rem;
}

/* Style the tooltip arrow */
.v-popper--theme-info-tooltip .v-popper__arrow-outer,
.v-popper--theme-info-tooltip .v-popper__arrow-inner {
  border-color: var(--sl-color-border);
}

/* Style markdown content */
.tooltip-markdown-content {
  line-height: 1.5;
}

.tooltip-markdown-content p:not(:last-child) {
  margin-bottom: 0.5rem;
}

.tooltip-markdown-content ul,
.tooltip-markdown-content ol {
  padding-left: 1.25rem;
  margin: 0.5rem 0;
}

.tooltip-markdown-content ul {
  list-style-type: disc;
}

.tooltip-markdown-content ol {
  list-style-type: decimal;
}

.tooltip-markdown-content li {
  margin: 0.25rem 0;
}

.tooltip-markdown-content a {
  color: var(--sl-color-accent-high);
  text-decoration: underline;
  transition: color 0.2s ease;
}

.tooltip-markdown-content a:hover {
  color: var(--sl-color-accent-low);
  text-decoration: none;
}

.tooltip-markdown-content code {
  background-color: var(--sl-color-bg-inline-code);
  color: var(--sl-color-text-inline-code);
  padding: 0.2em 0.4em;
  border-radius: 0.25rem;
  font-size: 0.9em;
  font-family: var(--sl-font-mono);
}

/* Ensure the tooltip trigger is properly aligned with text */
.inline-flex {
  display: inline-flex;
  vertical-align: middle;
}
</style>
