/**
 * @fileOverview  App-level controller code
 * @author Gerd Wagner
 */
import Person from "../m/Person.mjs";
import Actor from "../m/Actor.mjs";
import Director from "../m/Director.mjs";
import Movie, { MovieCategoryEL } from "../m/Movie.mjs";

/*******************************************
 *** Auxiliary methods for testing **********
 ********************************************/
/**
 *  Create and save test data
 */
function generateTestData() {
  try {

    Person.instances["14"] = new Person({
      personId: 14,
      name: "John Forbes Nash"
    });
    Person.instances["16"] = new Person({
      personId: 16,
      name: "Jane Doe"
    });
    Person.saveAll();

    Director.instances["1"] = new Director({
      personId: 1,
      name: "Stephen Frears"
    });
    Director.instances["2"] = new Director({
      personId: 2,
      name: "George Lucas"
    });
    Director.instances["3"] = new Director({
      personId: 3,
      name: "Quentin Tarantino"
    });
    Director.instances["9"] = new Director({
      personId: 9,
      name: "Russel Crowe",
    });
    Director.instances["10"] = new Director({
      personId: 10,
      name: "Seth MacFarlane",
    });
    Director.instances["13"] = new Director({
      personId: 13,
      name: "Marc Forster",
    });
    Director.instances["15"] = new Director({
      personId: 15,
      name: "John Doe",
    });
    Director.saveAll();

    Actor.instances["3"] = new Actor({
      personId: 3,
      name: "Quentin Tarantino"
    });
    Actor.instances["4"] = new Actor({
      personId: 4,
      name: "Uma Thurman",
      agent: 15
    });
    Actor.instances["5"] = new Actor({
      personId: 5,
      name: "John Travolta"
    });
    Actor.instances["6"] = new Actor({
      personId: 6,
      name: "Ewan McGregor"
    });
    Actor.instances["7"] = new Actor({
      personId: 7,
      name: "Natalie Portman"
    });
    Actor.instances["8"] = new Actor({
      personId: 8,
      name: "Keanu Reeves",
      agent: 16
    });
    Actor.instances["9"] = new Actor({
      personId: 9,
      name: "Russel Crowe",
      agent: 16
    });
    Actor.instances["10"] = new Actor({
      personId: 10,
      name: "Seth MacFarlane",
    });
    Actor.instances["11"] = new Actor({
      personId: 11,
      name: "Naomi Watts",
    });
    Actor.instances["12"] = new Actor({
      personId: 12,
      name: "Ed Harris",
      agent: 15
    });
    Actor.saveAll();

    Movie.instances["1"] = new Movie({
      movieId: 1,
      title: "Pulp Fiction",
      releaseDate: new Date("1994-05-12"),
      director_id: 3,
      actorIdRefs: [3,4,5],
    });
    Movie.instances["2"] = new Movie({
      movieId: 2,
      title: "Star Wars",
      releaseDate: new Date("1977-05-25"),
      director_id: 2,
      actorIdRefs: [6,7],
    });
    Movie.instances["3"] = new Movie({
      movieId: 3,
      title: "Dangerous Liaisons",
      releaseDate: new Date("1988-12-16"),
      director_id: 1,
      actorIdRefs: [8,4],
    });
    Movie.instances["4"] = new Movie({
      movieId: 4,
      title: "2015",
      releaseDate: new Date("2019-06-30"),
      category: MovieCategoryEL.TV_SERIES_EPISODE,
      tvSeriesName: "The Loudest Voice",
      episodeNo: 6,
      director_id: 1,
      actorIdRefs: [9, 10, 11],
    });
    Movie.instances["5"] = new Movie({
      movieId: 5,
      title: "A Beautiful Mind",
      releaseDate: new Date("2001-12-21"),
      category: MovieCategoryEL.BIOGRAPHY,
      about: 14,
      director_id: 9,
      actorIdRefs: [9, 12],
    });
    Movie.instances["6"] = new Movie({
      movieId: 6,
      title: "Stay",
      releaseDate: new Date("2005-09-24"),
      director_id: 13,
      actorIdRefs: [6, 11],
    });
    Movie.saveAll();
  } catch (e) {
    console.log( `${e.constructor.name}: ${e.message}`);
  }
}
/**
 * Clear data
 */
function clearData() {
  if (confirm( "Do you really want to delete the entire database?")) {
    try {
      [Director, Actor, Person, Movie].forEach(Class => {
        Class.instances = {};
      });
      /*
          Director.instances = {};
          Actor.instances = {};
          Person.instances = {};
          Movie.instances = {};
      */
      localStorage["directors"] = localStorage["actors"] = localStorage["people"] = "{}";
      localStorage["movies"] = "{}";
      console.log("All data cleared.");
    } catch (e) {
      console.log(`${e.constructor.name}: ${e.message}`);
    }
  }
}

export { generateTestData, clearData };
