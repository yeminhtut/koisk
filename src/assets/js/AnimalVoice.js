// myAnimalSounds.js

class AnimalSounds {
    constructor() {
      this.sounds = {
        dog: "Woof! Woof!",
        cat: "Meow! Meow!"
      };
    }
  
    // Method to get the sound of a dog
    dogVoice() {
      return this.sounds.dog;
    }
  
    // Method to get the sound of a cat
    catVoice() {
      return this.sounds.cat;
    }
  }
  
  // Export the AnimalSounds class so it can be imported and used in other files
  export default AnimalSounds;
  