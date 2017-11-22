![ga_cog_large_red_rgb](https://cloud.githubusercontent.com/assets/40461/8183776/469f976e-1432-11e5-8199-6ac91363302b.png)

# Mosaic Game

<figure>
	<a href="http://mosaic-game-app.herokuapp.com/"><img src="http://i.imgur.com/tu9OvRH.png"></a>
	<div>
		<figcaption><a href="http://mosaic-game-app.herokuapp.com/" title="Mosaic tile matching game">My first project at GA: A Bejewelled-style match game where pairs of tiles are swapped to match lines of the same color.</a></figcaption>
	</div>

</figure>

### Installation & Setup

#### Run Locally

- Download or clone the [Github repo](https://github.com/alexstride/wdi-project-1)
- Run `yarn` in the terminal to install dependencies
- Run `gulp` in the terminal to compile the source code and open in browser

#### View Online

- [View on Heroku](http://mosaic-game-app.herokuapp.com/)
- [View on Github](https://github.com/alexstride/wdi-project-1)

### Description

The project was to build a Javascript browser game and I chose to build a verison of a classic pattern match game, where the objective is to swap around colored tiles to create matching lines of three or more of the same color.

A timer counts down throughout the game and when a match is made the player both gains points (equal to the number of tiles matched) and has time added to the timer, to allow them to continue playing.

### Technologies used

The list of the languages, frameworks, lib used in the project:

- HTML5
- CSS3 (SASS)
- JavaScript (ES6)
- jQuery
- Gulp
- Yarn
- Git
- Github
- Heroku

### Challenges faced

The main challenge was allowing the state of the game to update in a manner which would allow the blocks to be animated to look as though they were falling into place. As the bulk of the checking for matches is carried out on a two-dimensional array in the background, the challenge was to update both the background array and the representation of tiles in the DOM, using the same randomly generated colors to update both, without the two going out of sync.

The solution I used was to work out how many random boxes needed to be generated to drop into each column and to position these boxes above the top of the game grid, where they are hidden. When the matched tiles are deleted, the boxes all have their new positions calculated and slide downwards with a simple CSS transition, giving the impression that thee are an unlimited number of blocks ready to drop into columns when they are needed.

### Rounding it off

Improvements that I would like to make to the project in the future would be:

To replace the absolute positioning of the boxes with columns displayed using flex-box, simplifying the problem of positioning and the falling animation.

Adjusting all positions to be dependent on screen-width, allowing the game to act fully responsively.

Give an option to play on a custom-sized grid.
