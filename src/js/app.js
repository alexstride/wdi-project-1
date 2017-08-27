const COLORS = ['#5679f7', '#f78a0e', '#d6d6d6', '#d60202', '#8f14d1', '#13c600', '#fcf63c'];
const WIDTH = 8;
const HEIGHT = WIDTH;

const gridObject = {
  colorArray: COLORS,
  width: WIDTH,
  height: HEIGHT,
  valueArray: null, //2D array of number values, representing colors
  $elementArray: null, //1D array of .box elements on the page
  activeBox1: null,
  activeBox2: null,

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

}; //End of the gridObject declaration

//Creating a Move object, which can be created for each move the user wants to make.
const moveObject = {
  activeBox1: null,
  activeBox2: null,
  areAdjacent: function() {
    return (Math.abs($(this.activeBox1).data('x') - $(this.activeBox2).data('x')) + Math.abs($(this.activeBox1).data('y') - $(this.activeBox2).data('y'))) === 1;
  },

  triggerMoveEvent: function() {
    //notify the grid object that there is now a change that needs to be handled and send through the coordinates of the squares which are being moved.
    $(document).trigger('userMove', [{x: $(this.activeBox1).data('x'), y: $(this.activeBox1).data('y')}, {x: $(this.activeBox2).data('x'), y: $(this.activeBox2).data('y')}]);

  },
  deactivateBoxes: function() {
    //Using a setTimeout of 0 to ensure that this stage cannot be queued to happen before the information about the clicked squares has been read from the DOM.
    window.setTimeout(() => {
      $(this.activeBox1).text('');
      this.activeBox1 = null;
      $(this.activeBox2).text('');
      this.activeBox2 = null;
    }, 0);
  }
}; //End of the moveObject

//This function needs to sit in the global scope as it inherits its context from the click event.
const processClick = function(clickEvent) {
  console.log(moveObject.activeBox1);
  if (!moveObject.activeBox1) {
    console.log('Setting active box 1');
    moveObject.activeBox1 = clickEvent.target;
    $(clickEvent.target).text('CSS');
  } else {
    moveObject.activeBox2 = clickEvent.target;
    if (moveObject.areAdjacent()) {
      moveObject.triggerMoveEvent();
    }
    moveObject.deactivateBoxes();
  }

};

$(function() {
  gridObject.initializeValueArray();
  gridObject.initializeElementArray();
  gridObject.initializeColors();
  gridObject.$elementArray.on('click', processClick);
  $(document).on('userMove', (e, pos1, pos2) => {
    console.log('User wants to move', pos1, pos2);
  });
});
