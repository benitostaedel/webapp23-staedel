/**
 * @fileOverview  The model class Director with attribute definitions,
 *     (class-level) check methods, setter methods, and the special 
 *     methods saveAll and retrieveAll
 * @author Gerd Wagner
 * @copyright Copyright � 2013-2014 Gerd Wagner, Chair of Internet Technology, 
 *     Brandenburg University of Technology, Germany. 
 * @license This code is licensed under The Code Project Open License (CPOL), 
 *     implying that the code is provided "as-is", can be modified to create 
 *     derivative works, can be redistributed, and can be used in commercial 
 *     applications.
 */
import Person from "./Person.mjs";
import Movie from "./Movie.mjs";
import { cloneObject } from "../../lib/util.mjs";

/**
 * Constructor function for the class Director
 * @constructor
 * @param {{personId: string, name: string}} [slots] -
 *     A record of parameters.
 */
class Director extends Person {
  // using a single record parameter with ES6 function parameter destructuring
  constructor ({personId, name}) {
    super({personId, name});  // invoke Person constructor
    // Person.instances[this.personId] = this;
    Director.instances[this.personId] = this;
  }


  toString() {
    var dirStr = `Director { persID: ${this.personId}, name: ${this.name}`;
    return `${dirStr} }`;
  }
}
/***********************************************
*** Class-level ("static") properties **********
************************************************/
// initially an empty collection (in the form of a map)
Director.instances = {};
window.Director = Director;
// add Director to the list of Person subtypes
Person.subtypes.push( Director);

/*********************************************************
*** Class-level ("static") storage management methods ****
**********************************************************/
/**
 * Create a new Director row
 * @method 
 * @static
 * @param {{personId: string, name: string}} slots - A record of parameters.
 */
Director.add = function (slots) {
  var dir = null;
  try {
    dir = new Director( slots);
  } catch (e) {
    console.log(`${e.constructor.name}: ${e.message}`);
    dir = null;
  }
  if (dir) {
    Director.instances[dir.personId] = dir;
    Person.instances[dir.personId] = dir;
    console.log(`${dir.toString()} created!`);
  }
};
/**
 * Update an existing Director row
 * @method 
 * @static
 * @param {{personId: string, name: string}} slots - A record of parameters.
 */
Director.update = function ({personId, name}) {
  const dir = Director.instances[personId],
        objectBeforeUpdate = cloneObject( dir);
  var noConstraintViolated = true, updatedProperties = [];
  try {
    if (name && dir.name !== name) {
      dir.name = name;
      updatedProperties.push("name");
    }

  } catch (e) {
    console.log( e.constructor.name + ": " + e.message);
    noConstraintViolated = false;
    // restore object to its state before updating
    Director.instances[personId] = objectBeforeUpdate;
  }
  if (noConstraintViolated) {
    if (updatedProperties.length > 0) {
      const ending = updatedProperties.length > 1 ? "ies" : "y";
      console.log(`Propert${ending} ${updatedProperties.toString()} modified for director ${name}`);
    } else {
      console.log(`No property value changed for director ${dir.name}!`);
    }
  }
};
/**
 * Delete an existing Director row
 * @method 
 * @static
 * @param {string} personId - The ID of a person.
 */
Director.destroy = function (personId) {
  const name = Director.instances[personId].name;
  for (const movieId of Object.keys( Movie.instances)) {
    const movie = Movie.instances[movieId];
    if (parseInt(movie.director.personId) === parseInt(personId)) delete Movie.instances[movieId];
  }
  delete Director.instances[personId];
  console.log(`Director ${name} deleted.`);
};
/**
 *  Retrieve all director objects as records
 */
Director.retrieveAll = function () {
  var directors={};
  if (!localStorage["directors"]) localStorage["directors"] = "{}";
  try {
    directors = JSON.parse( localStorage["directors"]);
  } catch (e) {
    console.log("Error when reading from Local Storage\n" + e);
  }
  for (const key of Object.keys( directors)) {
    try {  // convert record to (typed) object
      Director.instances[key] = new Director( directors[key]);
      // create superclass extension
      Person.instances[key] = Director.instances[key];
    } catch (e) {
      console.log(`${e.constructor.name} while deserializing director ${key}: ${e.message}`);
    }
  }
  console.log(`${Object.keys( Director.instances).length} Director records loaded.`);
}
/**
 * Save all Director objects as rows
 * @method
 * @static
 */
Director.saveAll = function () {
  try {
    localStorage["directors"] = JSON.stringify( Director.instances);
    localStorage["people"] = JSON.stringify( Person.instances);
    console.log( Object.keys( Director.instances).length +" directors saved.");
  } catch (e) {
    alert("Error when writing to Local Storage\n" + e);
  }
};

export default Director;
