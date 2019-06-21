# MaxMSP Brass Interface
A visual interface for creating NESS Brass score files and instruments. 

Requires the [NESS binary](http://www.ness.music.ed.ac.uk/music-and-tools/releases):
- Download and unzip
- place the "ness-brass" binary inside the Ness-Brass-Interface folder

Also requires Jeremy Bernstein's [shell.mxo object](https://github.com/jeremybernstein/shell/releases/tag/1.0b2)

# How to use

The interface allows you to create score and instrument files, and to create and listen to the audio files within Max.

1. Open the brass_interface.maxpat file.
2. Open the Score Builder to edit the score parameters.
3. The duration of the score/file is determined by the final event in the piano-roll style interface. All the other elements scale to this duration (e.g. the pressure and valve graphs).
4. Make changes to the instrument in the Instrument Builder window. You can start from a preset instrument, or use the sliders to set different elements.
5. Once you are happy with both the score and the instrument: 
    - press the green button to write the score and instrument files. ![green button](http://tommudd.co.uk/ness/button_green_2.png)
    - press the red button to create an audio file from these files. ![red button](http://tommudd.co.uk/ness/button_red.png)

The audio files will be written to the folder and will also appear in Max to listen to.

![main interface](http://tommudd.co.uk/ness/brass_main.png)

![score builder interface](http://tommudd.co.uk/ness/brass_score.png)

![instrument builder interface](http://tommudd.co.uk/ness/brass_instrument.png)
