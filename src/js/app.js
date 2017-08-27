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
  //Takes an html element and fills it with a color as inicated by an integer (looked up in the color array)
  $(element).css('background-color', colorArray[number]);
}

function areAdjacent($square1, $square2) {
  //Takes in two squares (as jquery objects) and returns boolean indicating whether they are adjacent.
  return (Math.abs($square1.data('x') - $square2.data('x')) + Math.abs($square1.data('y') - $square2.data('y'))) === 1;
}

function selectSquare($square) {
  //Takes in a square as a jquery object, changes some styles on it and returns the same element passed in.
  $square.text('!!');
  return $square;
}

function deselectSquare($square) {
  $square.text('');
  return $square;
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
  //TO DO: Use a match-checking function to eliminate any matches which are already in the grid at ititialization and bring in new random elements.
  //END OF INITIAL SETUP

  //Placing click event on all of the boxes which will register the coordinates of the two boxes clicked.

  //Two variables to store the pair of elements clicked on.
  let $clickedSquare1 = null;
  let $clickedSquare2 = null;
  $gridBoxes.on('click', function(e) {
    if(!$clickedSquare1) {
      $clickedSquare1 = selectSquare($(e.target));
    } else {
      $clickedSquare2 = selectSquare($(e.target));
      //run a function to check whether the two elements are adjacent. Logs and resets them if they are
      if(areAdjacent($clickedSquare1, $clickedSquare2)) {
        console.log($clickedSquare1.data(), $clickedSquare2.data());
      }
      deselectSquare($clickedSquare1);
      $clickedSquare1 = null;
      deselectSquare($clickedSquare2);
      $clickedSquare2 = null;
    }
  });
});
