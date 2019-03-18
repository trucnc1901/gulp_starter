import $ from 'jquery'
// const {changeText} = require('./bar.js')
import { changeText } from '../_js/components/bar.js';
import { changebackground } from '../_js/components/test.js';

const gridList = () => {
  $('.grid').masonry({
    // options
    // horizontalOrder: true,
    columnWidth: '.grid-sizer',
    itemSelector: '.grid-item',
    percentPosition: true,
    gutter: 10,
    fitWidth: true
  });
}

$(() => {
  changeText($('.title'), 'Hello World 123');
  changebackground($('body'));
  gridList();
})