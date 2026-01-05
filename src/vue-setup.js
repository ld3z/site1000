// src/vue-setup.js
import FloatingVue from 'floating-vue';
import 'floating-vue/dist/style.css';

export default (app) => {
  app.use(FloatingVue, {
    // Global options
    distance: 10,
    arrowPadding: 10,
    arrowOverflow: true,
    flip: true,
    shift: true,
    // Default theme
    themes: {
      'info-tooltip': {
        $extend: 'tooltip',
        $resetCss: true,
        triggers: ['hover', 'click'],
        hideTriggers: ['click'],
        autoHide: true,
        delay: {
          show: 100,
          hide: 100,
        },
        placement: 'top',
        autoSize: 'min',
        autoBoundaryMaxSize: true,
        overflow: {
          boundariesElement: 'viewport',
          padding: 5,
        },
      },
    },
  });

  // Set default theme
  FloatingVue.options.themes.tooltip.theme = 'info-tooltip';
};
