import $ from 'jquery'

const changeText = ($title, message) => {
  $title.click(function() {
    var aaa = $(this).text('DEMO CHI');
    // console.log($(this).text(aaa, 'DEMO CHI'))
  })
}

export { changeText }
