const colorArray = ['#5679f7', '#f78a0e', '#d6d6d6', '#d60202', '#8f14d1', '#13c600', '#fcf63c'];
const WIDTH = 8;

function createNewGridObject(width, numColors) {
  //A function to create a new grid object (array of arrays) using the dimensions defined by parameter n.
  const resultArray = [];
  for (let i = 0; i < width; i++) {
    const row = [];
    for (let j = 0; j < width; j++) {
      row.push(Math.floor(Math.random()*numColors));
    }
    resultArray.push(row);
  }
  return resultArray;
}

function fillFunction(element, number) {
  $(element).css('background-color', colorArray[number]);
}

$(() => {
  function fillColors() {
    //A function to initally fill all of the boxes with random colors;
    //flatenning out grid object
    const flatGridArray = gameObject.reduce((flatArray, array) => flatArray.concat(array));
    //looping over the dom elements for the boxes applyng the colors
    for (let i = 0; i < $gridBoxes.length; i++) {
      fillFunction($gridBoxes[i], flatGridArray[i]);
    }
  }

  //INITIAL SETUP
  //create a new grid object in memory
  const gameObject = createNewGridObject(WIDTH, colorArray.length);
  //grab all of the grid boxes
  const $gridBoxes = $('div.box');
  //fill all of the gridBoxes with their corresponding colors from the gridObject
  fillColors();
  //END OF INITIAL SETUP

});
