const COLORS = ['#5679f7', '#f78a0e', '#d6d6d6', '#d60202', '#8f14d1', '#13c600', '#fcf63c'];
const WIDTH = 8;
const HEIGHT = WIDTH;

const gridObject = {
  colorArray: COLORS,
  width: WIDTH,
  height: HEIGHT,
  valueArray: null, //2D array of number values, representing colors
  $elementArray: null, //1D array of .box elements on the page

  initializeValueArray: function () {
    //A function to create a new grid object (array of arrays) using the dimensions defined in args.
    const resultArray = [];
    for (let i = 0; i < this.height; i++) {
      const row = [];
      for (let j = 0; j < this.width; j++) {
        row.push(Math.floor(Math.random()*this.colorArray.length));
      }
      resultArray.push(row);
    }
    this.valueArray = resultArray;
  },

  initializeElementArray: function() {
    this.$elementArray = $('div.box');
  },

  initializeColors: function() {
    //A function to initally fill all of the boxes with random colors
    //flatenning out grid object
    const flatGridArray = gridObject.returnFlat();
    //looping over the dom elements for the boxes applyng the colors
    for (let i = 0; i < this.$elementArray.length; i++) {
      $(this.$elementArray[i]).css('background-color', this.colorArray[flatGridArray[i]]).attr('data-id', flatGridArray[i]);
    }
  },

  returnFlat: function() {
    return this.valueArray.reduce((flatArray, array) => flatArray.concat(array), []);
  }

};


$(function() {
  gridObject.initializeValueArray();
  gridObject.initializeElementArray();
  gridObject.initializeColors();
  gridObject.$elementArray.on('click', () => {
    console.log('You\'ve clicked on an element!');
  });
});

// //Functions pertaining to selecting pairs of squares in the grid
//
// function areAdjacent($square1, $square2) {
//   //Takes in two squares (as jquery objects) and returns boolean indicating whether they are adjacent.
//   return (Math.abs($square1.data('x') - $square2.data('x')) + Math.abs($square1.data('y') - $square2.data('y'))) === 1;
// }
//
// function selectSquare($square) {
//   //Takes in a square as a jquery object, changes some styles on it and returns the same element passed in.
//   console.log(`selecting square: (${$square.data('x')}, ${$square.data('y')})`);
//   $square.text('!!');
//   return $square;
// }
//
// function deselectSquare($square) {
//   console.log(`deselecting square: (${$square.data('x')}, ${$square.data('y')})`);
//   $square.text('');
//   return $square;
// }
//
// $(() => {
//   function fillColors() {
//     //A function to initally fill all of the boxes with random colors
//     //flatenning out grid object
//     const flatGridArray = gridObject.returnFlat();
//     //looping over the dom elements for the boxes applyng the colors
//     for (let i = 0; i < $gridBoxes.length; i++) {
//       gridObject.fillByHTML($gridBoxes[i], flatGridArray[i]);
//     }
//   }
//
//   //INITIAL SETUP
//   //create a new grid object in memory
//   gridObject.initializeValueArray();
//   //grab all of the grid boxes
//   const $gridBoxes = $('.box');
//   //fill all of the gridBoxes with their corresponding colors from the gridObject
//   fillColors();
//   //TO DO: Use a match-checking function to eliminate any matches which are already in the grid at ititialization and bring in new random elements.
//   //END OF INITIAL SETUP
//
//   //Placing click event on all of the boxes which will register the coordinates of the two boxes clicked.
//
//   //Two variables to store the pair of elements clicked on.
//   let $clickedSquare1 = null;
//   let $clickedSquare2 = null;
//   $gridBoxes.on('click', function(e) {
//     const a = new Date();
//     console.log(`click detected: ${a.getSeconds()}.${a.getMilliseconds()}`,$(e.target).data());
//     // if(!$clickedSquare1) {
//     //   $clickedSquare1 = $(e.target);
//     //   selectSquare($clickedSquare1);
//     // } else if (!$clickedSquare2) {
//     //   $clickedSquare2 = $(e.target);
//     //   selectSquare($clickedSquare2);
//     //   //run a function to check whether the two elements are adjacent. Logs and resets them if they are
//     //   if(areAdjacent($clickedSquare1, $clickedSquare2)) {
//     //     console.log($clickedSquare1.data(), $clickedSquare2.data());
//     //   }
//     //   //deselectSquare($clickedSquare1);
//     //   //$clickedSquare1 = null;
//     //   //deselectSquare($clickedSquare2);
//     //   //$clickedSquare2 = null;
//     // } else {
//     //   console.log('Both active squares have been set');
//     // }
//   });
// });
