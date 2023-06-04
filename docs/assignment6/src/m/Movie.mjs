/**
 * @fileOverview  The model class Movie with attribute definitions, (class-level) check methods,
 *                setter methods, and the special methods saveAll and retrieveAll
 * @author Gerd Wagner
 * @copyright Copyright 2013-2021 Gerd Wagner, Chair of Internet Technology, Brandenburg University of Technology, Germany.
 * @license This code is licensed under The Code Project Open License (CPOL), implying that the code is provided "as-is", 
 * can be modified to create derivative works, can be redistributed, and can be used in commercial applications.
 */
import { cloneObject, isIntegerOrIntegerString } from "../../lib/util.mjs";
import { ConstraintViolation, FrozenValueConstraintViolation, MandatoryValueConstraintViolation,
  NoConstraintViolation, RangeConstraintViolation,
  UniquenessConstraintViolation} from "../../lib/errorTypes.mjs";
import { Enumeration } from "../../lib/Enumeration.mjs";
import Person from "./Person.mjs";
import Actor from "./Actor.mjs";
import Director from "./Director.mjs";
/**
 * Enumeration type
 * @global
 */
const MovieCategoryEL = new Enumeration(["TV-Series-Episode","Biography"]);
/**
 * Constructor function for the class Movie
 * including the incomplete disjoint segmentation {TV Series Episode, Biography}
 * @class
 */
class Movie {
  // using a single record parameter with ES6 function parameter destructuring
  constructor ({movieId, title, releaseDate, actors, actorIdRefs, director, director_id,
                 category, tvSeriesName, episodeNo, about}) {
    this.movieId = movieId;
    this.title = title;
    this.releaseDate = releaseDate;

    // assign object references or ID references (to be converted in setter)
    this.actors = actors || actorIdRefs;
    if (director || director_id) {
      this.director = director || director_id;
    }
    // optional properties
    if (category) this.category = category;  // from BookCategoryEL
    if (tvSeriesName) this.tvSeriesName = tvSeriesName;
    if (episodeNo) this.episodeNo = episodeNo;
    if (about) this.about = about;
  }
  get movieId() {
    return this._movieId;
  }
  static checkMovieId( id) {
    if (!id) return new NoConstraintViolation();
    else if ( isNaN(parseInt(id)) || parseInt(id) < 1) {
      return new RangeConstraintViolation("The movie ID must be a positive integer!");
    } else {
      return new NoConstraintViolation();
    }
  }
  static checkMovieIdAsId( id) {
    var validationResult = Movie.checkMovieId( id);
    if ((validationResult instanceof NoConstraintViolation)) {
      if (!id) {
        validationResult = new MandatoryValueConstraintViolation(
            "A value for the movie ID must be provided!");
      } else if (Movie.instances[id]) {
        validationResult = new UniquenessConstraintViolation(
            "There is already a movie record with this movie ID!");
      } else {
        validationResult = new NoConstraintViolation();
      }
    }
    return validationResult;
  }

  set movieId( id) {
    const validationResult = Movie.checkMovieIdAsId( id);
    if (validationResult instanceof NoConstraintViolation) {
      this._movieId = id;
    } else {
      throw validationResult;
    }
  }

  get title() {
    return this._title;
  }
  static checkTitle( t) {
    if (!t) {
      return new MandatoryValueConstraintViolation("A title must be provided!");
    } else if (!(typeof(t) === "string" && t.trim() !== "")) {
      return new RangeConstraintViolation("The title must be a non-empty string!");
    } else {
      return new NoConstraintViolation();
    }
  }
  set title( t) {
    var validationResult = Movie.checkTitle( t);
    if (validationResult instanceof NoConstraintViolation) {
      this._title = t;
    } else {
      throw validationResult;
    }
  }

  get releaseDate() {
    return this._releaseDate;
  }
  static checkReleaseDate( releaseDate) {
    if (! releaseDate) {
      return new MandatoryValueConstraintViolation("A release date must be provided!");
    } else if (typeof releaseDate === "string") releaseDate = new Date(releaseDate);
    if(isNaN(releaseDate.getDate())) return new RangeConstraintViolation("The release date must be a valid date!");
    return new NoConstraintViolation();
  }
  set releaseDate( releaseDate) {
    const validationResult = Movie.checkReleaseDate( releaseDate);
    if (validationResult instanceof NoConstraintViolation) {
      if(!releaseDate || releaseDate === "") delete this.releaseDate;
      this._releaseDate = new Date(releaseDate);
    } else {
      throw validationResult;
    }
  }

  get director() {
    return this._director;
  }
  static checkDirector( director_id) {
    var validationResult = null;
    if (!director_id) {
      validationResult = new MandatoryValueConstraintViolation("A director must be provided!");
    } else {
      // invoke foreign key constraint check
      validationResult = Person.checkPersonIdAsIdRef( director_id);
    }
    return validationResult;
  }
  set director( d) {
    // d can be an ID reference or an object reference
    const director_id = (typeof d !== "object") ? d : d.personId;
    const validationResult = Movie.checkDirector( director_id);
    if (validationResult instanceof NoConstraintViolation) {
      // create the new director reference
      this._director = Director.instances[ director_id];
    } else {
      throw validationResult;
    }
  }

  get actors() {
    return this._actors;
  }
  static checkActor( actor_id) {
    var validationResult = null;
    if (!actor_id) {
      // actor(s) are optional
      validationResult = new NoConstraintViolation();
    } else {
      // invoke foreign key constraint check
      validationResult = Person.checkPersonIdAsIdRef( actor_id);
    }
    return validationResult;
  }

  addActor( a) {
    // a can be an ID reference or an object reference
    const actor_id = (typeof a !== "object") ? parseInt( a) : a.personId;
    if (actor_id) {
      const validationResult = Movie.checkActor( actor_id);
      if (actor_id && validationResult instanceof NoConstraintViolation) {
        // add the new actor reference
        const key = String( actor_id);
        this._actors[key] = Person.instances[key];
      } else {
        throw validationResult;
      }
    }
  }
  removeActor( a) {
    // a can be an ID reference or an object reference
    const actor_id = (typeof a !== "object") ? parseInt( a) : a.personId;
    if (actor_id) {
      const validationResult = Movie.checkActor( actor_id);
      if (validationResult instanceof NoConstraintViolation) {
        // delete the actor reference
        delete this._actors[String( actor_id)];
      } else {
        throw validationResult;
      }
    }
  }
  set actors( a) {
    this._actors = {};
    if (Array.isArray(a)) {  // array of IdRefs
      for (const idRef of a) {
        this.addActor( idRef);
      }
    } else {  // map of IdRefs to object references
      for (const idRef of Object.keys( a)) {
        this.addActor( a[idRef]);
      }
    }
  }


  get category() {
    return this._category;
  }

  static checkCategory( c) {
    if (c === undefined) {
      return new NoConstraintViolation();  // category is optional
    } else if (!isIntegerOrIntegerString( c) || parseInt( c) < 1 ||
        parseInt( c) > MovieCategoryEL.MAX) {
      return new RangeConstraintViolation(
          `Invalid value for category: ${c}`);
    } else {
      return new NoConstraintViolation();
    }
  }
  set category( c) {
    var validationResult = null;
    if (this.category) {  // already set/assigned
      validationResult = new FrozenValueConstraintViolation(
          "The category cannot be changed!");
    } else {
      validationResult = Movie.checkCategory( c);
    }
    if (validationResult instanceof NoConstraintViolation) {
      this._category = parseInt( c);
    } else {
      throw validationResult;
    }
  }

  get tvSeriesName() {
    return this._tvSeriesName;
  }
  static checkTvSeriesName( sN, c) {
    const cat = parseInt( c);
    if (cat === MovieCategoryEL.TV_SERIES_EPISODE && !sN) {
      return new MandatoryValueConstraintViolation(
          "A series name must be provided for a TV series episode!");
    } else if (cat !== MovieCategoryEL.TV_SERIES_EPISODE && sN) {
      return new ConstraintViolation("A series name must not " +
          "be provided if the movie is not a TV series episode!");
    } else if (sN && (typeof(sN) !== "string" || sN.trim() === "")) {
      return new RangeConstraintViolation(
          "The series name must be a non-empty string!");
    } else {
      return new NoConstraintViolation();
    }
  }
  set tvSeriesName( name) {
    const validationResult = Movie.checkTvSeriesName( name, this.category);
    if (validationResult instanceof NoConstraintViolation) {
      this._tvSeriesName = name;
    } else {
      throw validationResult;
    }
  }

  get episodeNo() {
    return this._episodeNo;
  }
  static checkEpisodeNo( eNo, c) {
    const cat = parseInt( c);
    if (cat === MovieCategoryEL.TV_SERIES_EPISODE && !eNo) {
      return new MandatoryValueConstraintViolation(
          "An episode number must be provided for a TV series episode!");
    } else if (cat !== MovieCategoryEL.TV_SERIES_EPISODE && eNo) {
      return new ConstraintViolation("An episode number must not " +
          "be provided if the movie is not a TV series episode!");
    } else if( isNaN(parseInt(eNo)) || parseInt(eNo) < 1) {
      return new RangeConstraintViolation("The episode number must be a positive integer!");
    } else {
      return new NoConstraintViolation();
    }
  }
  set episodeNo( eNo) {
    const validationResult = Movie.checkEpisodeNo( eNo, this.category);
    if (validationResult instanceof NoConstraintViolation) {
      this._episodeNo = eNo;
    } else {
      throw validationResult;
    }
  }

  get about() {return this._about;}

  static checkAbout( a, c) {
    const cat = parseInt( c);
    if (cat === MovieCategoryEL.BIOGRAPHY && !a) {
      return new MandatoryValueConstraintViolation(
          "A biography movie record must have an 'about' field!");
    } else if (cat !== MovieCategoryEL.BIOGRAPHY && a) {
      return new ConstraintViolation("An 'about' field value must not " +
          "be provided if the movie is not a biography!");
    } else {
      let validationResult = Person.checkPersonIdAsIdRef( a);
      if(!(validationResult instanceof NoConstraintViolation)) return validationResult;
      return new NoConstraintViolation();
    }
  }

  set about( a) {
    const validationResult = Movie.checkAbout( a, this.category);
    if (validationResult instanceof NoConstraintViolation) {
      this._about = a;
    } else {
      throw validationResult;
    }
  }
  /*********************************************************
   ***  Other Instance-Level Methods  ***********************
   **********************************************************/
  toString() {
    var movieStr = `Movie{ movie ID: ${this.movieId}, title: ${this.title}, release date: ${this.releaseDate}`;
    switch (this.category) {
      case MovieCategoryEL.TV_SERIES_EPISODE:
        movieStr += `, tv series episode name: ${this.tvSeriesName}`;
        movieStr += `, tv series episode number: ${this.episodeNo}`;
        break;
      case MovieCategoryEL.BIOGRAPHY:
        movieStr += `, biography about: ${this.about}`;
        break;
    }
    if ( this.director) movieStr += `, director: ${this.director.name}`;
    return `${movieStr}, actors: ${Object.keys( this.actors).join(",")} }`;
  }

  // Convert object to record with ID references
  toJSON() {  // is invoked by JSON.stringify in Movie.saveAll
    var rec = {};
    for (const p of Object.keys( this)) {
      // copy only property slots with underscore prefix
      if (p.charAt(0) !== "_") continue;
      switch (p) {
        case "_director":
          // convert object reference to ID reference
          if (this._director) rec.director_id = this._director.personId;
          break;
        case "_actors":
          // convert the map of object references to a list of ID references
          rec.actorIdRefs = [];
          for (const actorIdStr of Object.keys( this.actors)) {
            rec.actorIdRefs.push( parseInt( actorIdStr));
          }
          break;
        default:
          // remove underscore prefix
          rec[p.substr(1)] = this[p];
      }
    }
    return rec;
  }
}
/***********************************************
*** Class-level ("static") properties **********
************************************************/
// initially an empty collection (in the form of a map)
Movie.instances = {};
window.Movie = Movie;

/************************************************
*** Class-level ("static") methods **************
*************************************************/
/**
 * Create a new Movie record
 * @method 
 * @static
 * @param {{movieId: string, title: string, releaseDate: number, actorIdRefsToAdd: number[], actorIdRefsToRemove: number[], director_id: number, category: ?number, tvSeriesName: ?string, episodeNo: ?number, about: ?string}} slots - A record of parameters.
 */
Movie.add = function (slots) {
  var movie = null;
  try {
    movie = new Movie( slots);
  } catch (e) {
    console.log(`${e.constructor.name}: ${e.message}`);
    movie = null;
  }
  if (movie) {
    console.log(slots)
    Movie.instances[movie.movieId] = movie;
    console.log(`${movie.toString()} created!`);
  }
};
/**
 * Update an existing Movie record
 * where the slots argument contains the slots to be updated and performing 
 * the updates with setters makes sure that the new values are validated
 * @method 
 * @static
 * @param {{movieId: string, title: string, releaseDate: number, actorIdRefsToAdd: number[], actorIdRefsToRemove: number[], director_id: number, category: ?number, tvSeriesName: ?string, episodeNo: ?number, about: ?string}} slots - A record of parameters.
 */
Movie.update = function ({movieId, title, releaseDate,  actorIdRefsToAdd, actorIdRefsToRemove, director_id,
                           category, tvSeriesName, episodeNo, about}) {
  const movie = Movie.instances[movieId],
        objectBeforeUpdate = cloneObject( movie);
  var noConstraintViolated = true, updatedProperties = [];
  try {
    if (title && movie.title !== title) {
      movie.title = title;
      updatedProperties.push("title");
    }
    if (releaseDate && movie.releaseDate !== releaseDate) {
      movie.releaseDate = releaseDate;
      updatedProperties.push("releaseDate");
    }

    if (actorIdRefsToAdd) {
      updatedProperties.push("actors(added)");
      for (const actorIdRef of actorIdRefsToAdd) {
        movie.addActor( actorIdRef);
      }
    }
    if (actorIdRefsToRemove) {
      updatedProperties.push("actors(removed)");
      for (const actor_id of actorIdRefsToRemove) {
        movie.removeActor( actor_id);
      }
    }
    if (director_id && movie._director.personId !== director_id) {
      movie.director = director_id;
      updatedProperties.push("director");
    }

    if (category) {
      if (movie.category === undefined) {
        movie.category = category;
        updatedProperties.push("category");
      } else if (category !== movie.category) {
        throw new FrozenValueConstraintViolation(
            "The movie category must not be changed!");
      }
    } else if (category === "" && "category" in movie) {
      throw new FrozenValueConstraintViolation(
          "The movie category must not be unset!");
    }
    if (tvSeriesName && movie.tvSeriesName !== tvSeriesName) {
      movie.tvSeriesName = tvSeriesName;
      updatedProperties.push("tvSeriesName");
    }
    if (episodeNo && movie.episodeNo !== episodeNo) {
      movie.episodeNo = episodeNo;
      updatedProperties.push("episodeNo");
    }
    if (about && movie.about !== about) {
      movie.about = about;
      updatedProperties.push("about");
    }
  } catch (e) {
    console.log(`${e.constructor.name}: ${e.message}`);
    noConstraintViolated = false;
    // restore object to its previous state (before updating)
    Movie.instances[movieId] = objectBeforeUpdate;
  }
  if (noConstraintViolated) {
    if (updatedProperties.length > 0) {
      let ending = updatedProperties.length > 1 ? "ies" : "y";
      console.log(`Propert${ending} ${updatedProperties.toString()} modified for movie ${movieId}`);
    } else {
      console.log(`No property value changed for movie ${movie.toString()}!`);
    }
  }
};
/**
 * Delete an existing Movie record
 * @method 
 * @static
 * @param {string} movieId - The movie ID of a movie.
 */
Movie.destroy = function (movieId) {
  const movie = Movie.instances[movieId];
  if (Movie.instances[movieId]) {
    console.log(`${Movie.instances[movieId].toString()} deleted!`);
    delete Movie.instances[movieId];

    if (Object.values( Movie.instances).every((m) => movie.director.personId !== m.director.personId)) {
      console.log(`${Director.instances[movie.director.personId].toString()} deleted!`);
      delete Director.instances[movie.director.personId];
    }

    console.log(Object.values( movie.actors));
    for ( const actor of Object.values( movie.actors)) {
Object.values( Movie.instances).every((m) => {
const asdf = !(actor.personId in m.actors);
        console.log(Object.keys(m.actors), actor.personId, asdf, m);
return asdf;
      })
      if (Object.values( Movie.instances).every((m) => !(actor.personId in m.actors))) {
        console.log(Actor.instanc)
        console.log(`${Actor.instances[actor.personId].toString()} deleted!`);
        delete Actor.instances[actor.personId];
      }
    }
  } else {
    console.log(`There is no movie with movie ID ${movieId} in the database!`);
  }
};
/**
 * Load all movie table records and convert them to objects
 * Precondition: actors and directors must be loaded first
 * @method 
 * @static
 */
Movie.retrieveAll = function () {
  Person.retrieveAll();
  var movies={};
  try {
    if (!localStorage["movies"]) localStorage.setItem("movies", "{}");
    else {
      movies = JSON.parse( localStorage["movies"]);
      console.log( Object.keys( movies).length +" movies loaded.");
    }
  } catch (e) {
    alert("Error when reading from Local Storage\n" + e);
  }
  for (const movieId of Object.keys( movies)) {
    Movie.instances[movieId] = Movie.convertRec2Obj( movies[movieId]);
  }
};
/**
 * Convert movie record to movie object
 * @method 
 * @static
 * @param {{movieId: string, title: string, releaseDate: number, category: ?number, tvSeriesName: ?string, episodeNo: ?number, about: ?string}} slots - A record of parameters.
 * @returns {object}
 */
Movie.convertRec2Obj = function (movieRow) {
  var movie=null;
  try {
    movie = new Movie( movieRow);
  } catch (e) {
    console.log(`${e.constructor.name} while deserializing a movie record: ${e.message}`);
  }
  return movie;
};
/**
 * Save all Movie objects as records
 * @method 
 * @static
 */
Movie.saveAll = function () {
  const nmrOfMovies = Object.keys( Movie.instances).length;
  try {
    localStorage["movies"] = JSON.stringify( Movie.instances);
    console.log(`${nmrOfMovies} movie records saved.`);
  } catch (e) {
    alert("Error when writing to Local Storage\n" + e);
  }
};

export default Movie;
export { MovieCategoryEL };
