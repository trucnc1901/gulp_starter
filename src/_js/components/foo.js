import $ from 'jquery'
// import { changeText } from '../_js/components/bar.js';
// import { changebackground } from '../_js/components/alert.js';

const gridList = (grid) => {
  grid.masonry({
    // options
    // horizontalOrder: true,
    columnWidth: '.grid-sizer',
    itemSelector: '.grid-item',
    percentPosition: true,
    gutter: 10,
    // fitWidth: true
  });
}

export { gridList }