/**
 * @fileOverview  View code of UI for managing Movie data
 * @author Gerd Wagner
 * @copyright Copyright 2013-2021 Gerd Wagner, Chair of Internet Technology, Brandenburg University of Technology, Germany.
 * @license This code is licensed under The Code Project Open License (CPOL), implying that the code is provided "as-is", 
 * can be modified to create derivative works, can be redistributed, and can be used in commercial applications.
 */
/***************************************************************
 Import classes, datatypes and utility procedures
 ***************************************************************/
import Movie, { MovieCategoryEL} from "../m/Movie.mjs";
import Person from "../m/Person.mjs";
import Actor from "../m/Actor.mjs";
import Director from "../m/Director.mjs";
import { displaySegmentFields, undisplayAllSegmentFields } from "./app.mjs"
import { fillSelectWithOptions, createIsoDateString, createMultiSelectionWidget, createListFromMap } from "../../lib/util.mjs";

/***************************************************************
 Load data
 ***************************************************************/
Movie.retrieveAll();

/***************************************************************
 Set up general, use-case-independent UI elements
 ***************************************************************/
/**
 * Setup User Interface
 */
// set up back-to-menu buttons for all use cases
for (const btn of document.querySelectorAll("button.back-to-menu")) {
  btn.addEventListener('click', refreshManageDataUI);
}
// neutralize the submit event for all use cases
for (const frm of document.querySelectorAll("section > form")) {
  frm.addEventListener("submit", function (e) {
    e.preventDefault();
    frm.reset();
  });
}
// save data when leaving the page
window.addEventListener("beforeunload", function () {
  Movie.saveAll();
  Person.saveAll();
  Actor.saveAll();
  Director.saveAll();
});

/**********************************************
 * Use case Retrieve/List Movies
**********************************************/
document.getElementById("RetrieveAndListAll")
    .addEventListener("click", function () {
  const tableBodyEl = document.querySelector("section#Movie-R > table > tbody");
  // reset view table (drop its previous contents)
  tableBodyEl.innerHTML = "";
  // populate view table
  for (const key of Object.keys( Movie.instances)) {
    const movie = Movie.instances[key];
      console.log(movie.actors)
    const actorListEl = createListFromMap( movie.actors, "name");
    const row = tableBodyEl.insertRow();
    row.insertCell().textContent = movie.movieId;
    row.insertCell().textContent = movie.title;
    row.insertCell().textContent = createIsoDateString( movie.releaseDate);
    if (movie.category) {
      switch (movie.category) {
      case MovieCategoryEL.TV_SERIES_EPISODE:
        row.insertCell().textContent = `${movie.tvSeriesName} ${MovieCategoryEL.labels[movie.category-1]} ${movie.episodeNo}`;
        break;
      case MovieCategoryEL.BIOGRAPHY:
        row.insertCell().textContent = `${MovieCategoryEL.labels[movie.category-1]} about ${Person.instances[movie.about].name}`;
        break;
      }
    } else row.insertCell();
    row.insertCell().appendChild( actorListEl);
    if ( movie.director) row.insertCell().textContent = movie.director.name;
    else row.insertCell();
  }
  document.getElementById("Movie-M").style.display = "none";
  document.getElementById("Movie-R").style.display = "block";
});

/**********************************************
 * Use case Create Movie
**********************************************/
const createFormEl = document.querySelector("section#Movie-C > form"),
      createCategorySelectEl = createFormEl.category,
      selectActorsEl = createFormEl.selectActors,
      selectAboutEl = createFormEl.selectAbout,
      selectDirectorEl = createFormEl.selectDirector;
//----- set up event handler for menu item "Create" -----------
document.getElementById("Create").addEventListener("click", function () {
  fillSelectWithOptions( selectDirectorEl, Director.instances, "personId", { displayProp: "name" });
  fillSelectWithOptions( selectActorsEl, Actor.instances, "personId", {displayProp: "name"});
  fillSelectWithOptions( selectAboutEl, Person.instances, "personId", {displayProp: "name"});
  document.getElementById("Movie-M").style.display = "none";
  document.getElementById("Movie-C").style.display = "block";
  undisplayAllSegmentFields( createFormEl, MovieCategoryEL.labels);
  createFormEl.reset();
});
// set up event handlers for responsive constraint validation
createFormEl.movieId.addEventListener("input", function () {
  createFormEl.movieId.setCustomValidity(
    Movie.checkMovieIdAsId( createFormEl.movieId.value).message);
});
createFormEl.tvSeriesName.addEventListener("input", function () {
  createFormEl.tvSeriesName.setCustomValidity(
    Movie.checkTvSeriesName( createFormEl.tvSeriesName.value,
      parseInt( createFormEl.category.value) + 1).message);
});
createFormEl.episodeNo.addEventListener("input", function () {
  createFormEl.episodeNo.setCustomValidity(
    Movie.checkEpisodeNo( createFormEl.episodeNo.value,
      parseInt( createFormEl.category.value) + 1).message);
});
createFormEl.selectAbout.addEventListener("change", function () {
  createFormEl.selectAbout.setCustomValidity(
    Movie.checkAbout( createFormEl.selectAbout.value,
      parseInt( createFormEl.category.value) + 1).message);
});
createFormEl.title.addEventListener("input", function () {
  createFormEl.title.setCustomValidity(
    Movie.checkTitle( createFormEl.title.value,
      parseInt( createFormEl.category.value) + 1).message);
});
createFormEl.selectDirector.addEventListener("change", function () {
  createFormEl.selectDirector.setCustomValidity(
    Movie.checkDirector( createFormEl.selectDirector.value,
      parseInt( createFormEl.category.value) + 1).message);
});

// set up the movie category selection list
fillSelectWithOptions( createCategorySelectEl, MovieCategoryEL.labels);
createCategorySelectEl.addEventListener("change", handleCategorySelectChangeEvent);

// handle Save button click events
createFormEl["commit"].addEventListener("click", function () {
  const categoryStr = createFormEl.category.value;
  const slots = {
    movieId: parseInt(createFormEl.movieId.value),
    title: createFormEl.title.value,
    releaseDate: createFormEl.releaseDate.value,
    actorIdRefs: [],
    director_id: parseInt(createFormEl.selectDirector.value)
  };
  if (categoryStr) {
    // enum literal indexes start with 1
    slots.category = parseInt( categoryStr) + 1;
    switch (slots.category) {
    case MovieCategoryEL.TV_SERIES_EPISODE:
      slots.tvSeriesName = createFormEl.tvSeriesName.value;
      slots.episodeNo = createFormEl.episodeNo.value;
      createFormEl.tvSeriesName.setCustomValidity(
        Movie.checkTvSeriesName( createFormEl.tvSeriesName.value, slots.category).message);
      createFormEl.episodeNo.setCustomValidity(
          Movie.checkEpisodeNo( createFormEl.episodeNo.value, slots.category).message);
      break;
    case MovieCategoryEL.BIOGRAPHY:
      slots.about = createFormEl.selectAbout.value;
      createFormEl.selectAbout.setCustomValidity(
        Movie.checkAbout( createFormEl.selectAbout.value, slots.category).message);
      break;
    }
  }
  // check all input fields and show error messages
  createFormEl.movieId.setCustomValidity(
      Movie.checkMovieIdAsId( slots.movieId).message);
  createFormEl.title.setCustomValidity(
      Movie.checkTitle( slots.title).message);
  createFormEl.releaseDate.setCustomValidity(
      Movie.checkReleaseDate( slots.releaseDate).message);
  createFormEl.selectDirector.setCustomValidity(
      Movie.checkDirector( slots.director_id).message);
  // save the input data only if all form fields are valid

  const selActorOptions = createFormEl.selectActors.selectedOptions;
  if (createFormEl.checkValidity()) {
    for (const opt of selActorOptions) {
      slots.actorIdRefs.push( opt.value);
    }

    Movie.add( slots);
    // un-render all segment/category-specific fields
    undisplayAllSegmentFields( createFormEl, MovieCategoryEL.labels);
  }
});

/**********************************************
 * Use case Update Movie
**********************************************/
const updateFormEl = document.querySelector("section#Movie-U > form"),
      updateSelectMovieEl = updateFormEl["selectMovie"],
      updateSelectCategoryEl = updateFormEl["category"];
undisplayAllSegmentFields( updateFormEl, MovieCategoryEL.labels);
// handle click event for the menu item "Update"
document.getElementById("Update").addEventListener("click", function () {
  // reset selection list (drop its previous contents)
  updateSelectMovieEl.innerHTML = "";
  // populate the selection list
  fillSelectWithOptions( updateSelectMovieEl, Movie.instances,
      "movieId", {displayProp:"title"});
  document.getElementById("Movie-M").style.display = "none";
  document.getElementById("Movie-U").style.display = "block";
  updateFormEl.reset();
});
updateSelectMovieEl.addEventListener("change", handleMovieSelectChangeEvent);
// set up the movie category selection list
fillSelectWithOptions( updateSelectCategoryEl, MovieCategoryEL.labels);
updateSelectCategoryEl.addEventListener("change", handleCategorySelectChangeEvent);

/* SIMPLFIED CODE: no responsive validation of "title" and "releaseDate" */
// responsive validation of form fields for segment properties
updateFormEl.tvSeriesName.addEventListener("input", function () {
  updateFormEl.tvSeriesName.setCustomValidity(
      Movie.checkTvSeriesName( updateFormEl.tvSeriesName.value,
          parseInt( updateFormEl.category.value) + 1).message);
});
updateFormEl.episodeNo.addEventListener("input", function () {
  updateFormEl.episodeNo.setCustomValidity(
      Movie.checkEpisodeNo( updateFormEl.episodeNo.value,
          parseInt( updateFormEl.category.value) + 1).message);
});
updateFormEl.about.addEventListener("input", function () {
  updateFormEl.about.setCustomValidity(
      Movie.checkAbout( updateFormEl.about.value,
          parseInt( updateFormEl.category.value) + 1).message);
});
updateFormEl.title.addEventListener("input", function () {
  updateFormEl.title.setCustomValidity(
      Movie.checkTitle( updateFormEl.title.value,
          parseInt( updateFormEl.category.value) + 1).message);
});
updateFormEl.releaseDate.addEventListener("input", function () {
  updateFormEl.releaseDate.setCustomValidity(
      Movie.checkReleaseDate( updateFormEl.releaseDate.valueAsDate,
          parseInt( updateFormEl.category.value) + 1).message);
});
updateFormEl.selectDirector.addEventListener("change", function () {
  updateFormEl.selectDirector.setCustomValidity(
      Movie.checkDirector( updateFormEl.selectDirector.value,
          parseInt( updateFormEl.category.value) + 1).message);
});


// handle Save button click events
updateFormEl["commit"].addEventListener("click", function () {
  const categoryStr = updateFormEl.category.value;
  const movieIdRef = updateSelectMovieEl.value;
  const selectActorsWidget = updateFormEl.querySelector(".MultiSelectionWidget"),
    selectedActorsListEl = selectActorsWidget.firstElementChild;
  if (!movieIdRef) return;
  var slots = {
    movieId: updateFormEl.movieId.value,
    title: updateFormEl.title.value,
    releaseDate: updateFormEl.releaseDate.value,
    director_id: updateFormEl.selectDirector.value
  };
  if (categoryStr) {
    slots.category = parseInt( categoryStr) + 1;
    switch (slots.category) {
    case MovieCategoryEL.TV_SERIES_EPISODE:
      slots.tvSeriesName = updateFormEl.tvSeriesName.value;
      updateFormEl.tvSeriesName.setCustomValidity(
        Movie.checkTvSeriesName( slots.tvSeriesName, slots.category).message);
      slots.episodeNo = updateFormEl.episodeNo.value;
      updateFormEl.episodeNo.setCustomValidity(
          Movie.checkEpisodeNo( slots.episodeNo, slots.category).message);
      break;
    case MovieCategoryEL.BIOGRAPHY:
      slots.about = updateFormEl.selectAbout.value;
      updateFormEl.about.setCustomValidity(
          Movie.checkAbout( slots.about, slots.category).message);
      break;
    }
  }
  // check all input fields and show error messages
  updateFormEl.movieId.setCustomValidity( Movie.checkMovieId( slots.movieId).message);
  updateFormEl.title.setCustomValidity( Movie.checkTitle( slots.title).message);
  updateFormEl.releaseDate.setCustomValidity( Movie.checkReleaseDate( slots.releaseDate).message);
  /* SIMPLFIED CODE: no on-submit validation of "title" and "releaseDate" */
  // save the input data only if all form fields are valid
  if (updateFormEl.checkValidity()) {
    // construct actorIdRefs-ToAdd/ToRemove lists
    const actorIdRefsToAdd=[], actorIdRefsToRemove=[];
    for (const actorItemEl of selectedActorsListEl.children) {
      if (actorItemEl.classList.contains("removed")) {
        actorIdRefsToRemove.push( actorItemEl.getAttribute("data-value"));
      }
      if (actorItemEl.classList.contains("added")) {
        actorIdRefsToAdd.push( actorItemEl.getAttribute("data-value"));
      }
    }
    // if the add/remove list is non-empty, create a corresponding slot
    if (actorIdRefsToRemove.length > 0) {
      slots.actorIdRefsToRemove = actorIdRefsToRemove;
    }
    if (actorIdRefsToAdd.length > 0) {
      slots.actorIdRefsToAdd = actorIdRefsToAdd;
    }

    Movie.update( slots);
    // un-render all segment/category-specific fields
    undisplayAllSegmentFields( updateFormEl, MovieCategoryEL.labels);
    // update the movie selection list's option element
    updateSelectMovieEl.options[updateSelectMovieEl.selectedIndex].text = slots.title;

    selectActorsWidget.innerHTML = "";
  }
});
/**
 * handle movie selection events
 * when a movie is selected, populate the form with the data of the selected movie
 */
function handleMovieSelectChangeEvent () {
  const selectActorsWidget = updateFormEl.querySelector(".MultiSelectionWidget"),
    selectDirectorEl = updateFormEl["selectDirector"];
  const movieId = updateFormEl.selectMovie.value;
  if (movieId) {
    const movie = Movie.instances[movieId];
    updateFormEl.movieId.value = movie.movieId;
    updateFormEl.title.value = movie.title;
    updateFormEl.releaseDate.valueAsDate = movie.releaseDate;
    
    fillSelectWithOptions( selectDirectorEl, Person.instances, "personId", {displayProp: "name"});
    createMultiSelectionWidget( selectActorsWidget, movie.actors, Person.instances, "personId", "name");
    if (movie.director) updateFormEl.selectDirector.value = movie.director.personId;

    if (movie.category) {
      updateFormEl.category.selectedIndex = movie.category;
      // disable category selection (category is frozen)
      updateFormEl.category.disabled = "disabled";
      // show category-dependent fields
      displaySegmentFields( updateFormEl, MovieCategoryEL.labels, movie.category);
      switch (movie.category) {
      case MovieCategoryEL.TV_SERIES_EPISODE:
        updateFormEl.tvSeriesName.value = movie.tvSeriesName;
        updateFormEl.episodeNo.value = movie.episodeNo;
        updateFormEl.about.value = "";
        break;
      case MovieCategoryEL.BIOGRAPHY:
        updateFormEl.about.value = movie.about;
        updateFormEl.tvSeriesName.value = "";
        updateFormEl.episodeNo.value = "";
        break;
      }
    } else {  // movie has no value for category
      updateFormEl.category.value = "";
      updateFormEl.category.disabled = "";   // enable category selection
      updateFormEl.tvSeriesName.value = "";
      updateFormEl.episodeNo.value = "";
      updateFormEl.about.value = "";
      undisplayAllSegmentFields( updateFormEl, MovieCategoryEL.labels);
    }
  } else {
    updateFormEl.reset();
    updateFormEl.selectDirector.selectedIndex = 0;
    selectActorsWidget.innerHTML = "";
  }
}

/**********************************************
 * Use case Delete Movie
**********************************************/
const deleteFormEl = document.querySelector("section#Movie-D > form");
const delSelMovieEl = deleteFormEl.selectMovie;
// set up event handler for Update button
document.getElementById("Delete").addEventListener("click", function () {
  // reset selection list (drop its previous contents)
  delSelMovieEl.innerHTML = "";
  // populate the selection list
  fillSelectWithOptions( delSelMovieEl, Movie.instances,
      "movieId", {displayProp:"title"});
  document.getElementById("Movie-M").style.display = "none";
  document.getElementById("Movie-D").style.display = "block";
  deleteFormEl.reset();
});
// handle Delete button click events
deleteFormEl["commit"].addEventListener("click", function () {
  const movieIdRef = delSelMovieEl.value;
  if (!movieIdRef) return;
  if (confirm("Do you really want to delete this movie?")) {
    Movie.destroy( movieIdRef);
    delSelMovieEl.remove( delSelMovieEl.selectedIndex);
  }
});


/**********************************************
 * Refresh the Manage Movies Data UI
 **********************************************/
function refreshManageDataUI() {
  // show the manage movie UI and hide the other UIs
  document.getElementById("Movie-M").style.display = "block";
  document.getElementById("Movie-R").style.display = "none";
  document.getElementById("Movie-C").style.display = "none";
  document.getElementById("Movie-U").style.display = "none";
  document.getElementById("Movie-D").style.display = "none";
}

/**
 * event handler for movie category selection events
 * used both in create and update
 */
function handleCategorySelectChangeEvent (e) {
  const formEl = e.currentTarget.form,
        // the array index of MovieCategoryEL.labels
        categoryIndexStr = formEl.category.value;
  if (categoryIndexStr) {
    displaySegmentFields( formEl, MovieCategoryEL.labels,
        parseInt( categoryIndexStr) + 1);
  } else {
    undisplayAllSegmentFields( formEl, MovieCategoryEL.labels);
  }
}

// Set up Manage Movies UI
refreshManageDataUI();
