/**
 * LineReader
 * https://github.com/mgmeyers/LineReader
 *
 * Copyright 2014 Matthew Meyers <hello@matthewmeye.rs>
 * Released under the MIT license:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Reads a file one line at a time.
 *
 * @param {Object} options -- options for the line reader
 *
 * Available options:
 *   chunkSize {Integer} -- how much of the file to read at a time
 */
var LineReader = function (options) {

  /**
   * If 'this' isn't an instance of 'LineReader', then the user forgot to use
   * the 'new' keyword, let's do it for them, otherwise, 'this' will reference
   * the 'window' object
   */
  if ( !(this instanceof LineReader) ) {
    return new LineReader(options);
  }

  /**
   * We'll use '_internals' to store data we don't want public facing
   *
   * We'll also need a reference to 'this', as it will be overridden in the
   * 'onload' and 'onerror' events
   */
  var internals = this._internals = {};
  var self = this;

  /**
   * Let's create a 'FileReader' instance, we'll only need one per 'LineReader'
   * instance
   */
  internals.reader = new FileReader();

  /**
   * If 'chunkSize' has been set by the user, use that value, otherwise,
   * default to 1024
   */
  internals.chunkSize = ( options && options.chunkSize )
    ? options.chunkSize
    : 1024;

  /**
   * Let's create an object to house user defined event callbacks
   */
  internals.events = {};

  /**
   * 'canRead' will be set to false if the LineReader#abort method is fired
   */
  internals.canRead = true;

  /**
   * FileReader#onload' event. This gets called when any read operations have
   * completed
   */
  internals.reader.onload = function () {

    /**
     * Store the processed text by tagging it on to any existing processed text
     * 'this' refers to our 'FileReader' instance
     */
    internals.chunk += this.result;

    /**
     * If the processed text contains a newline character
     */
    if ( /\r|\n/.test( internals.chunk ) ) {
      /**
       * Split the text into an array of lines
       */
      internals.lines = internals.chunk.match(/[^\r\n]+/g);

      /**
       * If there is still more data to read, save the last line, as it may be
       * incomplete
       */
      if ( self._hasMoreData() ) {
        /**
         * If the loaded chunk ends with a newline character then the last line
         * is complete and we don't need to store it
         */
        internals.chunk = internals.chunk[internals.chunk.length - 1] === '\n' ?
          '' :
          internals.lines.pop();
      }

      /**
       * Start stepping through each line
       */
      self._step();

    /**
     * If the text did not contain a newline character
     */
    } else {

      /**
       * Start another round of the read process if there is still data to read
       */
      if ( self._hasMoreData() ) {
        return self.read();
      }

      /**
       * If there is no data left to read, but there is still data stored in
       * 'chunk', emit it as a line
       */
      if ( internals.chunk.length ) {
        return self._emit('line', [
          internals.chunk,
          self._emit.bind(self, 'end')
        ]);
      }

      /**
       * if there is no data stored in 'chunk', emit the end event
       */
      self._emit('end');
    }
  };

  /**
   * 'FileReader#onerror' event. This gets called any time there is an error
   * reading a file
   */
  internals.reader.onerror = function () {
    /**
     * Emit the error event, passing along the error object to the callback
     * 'this' refers to our 'FileReader' instance
     */
    self._emit('error', [ this.error ]);
  };
};


/**
 * LineReader#on
 *
 * Binds events
 *
 * @param {String} eventName -- the name of the event to bind to
 * @param {Function} cb -- the function to execute when the event is triggered
 */
LineReader.prototype.on = function (eventName, cb) {
  this._internals.events[ eventName ] = cb;
};


/**
 * LineReader#read
 *
 * Starts the read process
 *
 * @param {File} file -- The file reference to process
 */
LineReader.prototype.read = function (file) {
  var internals = this._internals;

  /**
   * If 'file' is defined, then we want to get some information about it and
   * reset 'readPos', 'chunk', and 'lines'
   */
  if (typeof file !== 'undefined') {
    internals.file = file;
    internals.fileLength = file.size;
    internals.readPos = 0;
    internals.chunk = '';
    internals.lines = [];
  }

  /**
   * Extract a section of the file for reading starting at 'readPos' and
   * ending at 'readPos + chunkSize'
   */
  var blob = internals.file.slice( internals.readPos, internals.readPos + internals.chunkSize );

  /**
   * Update our current read position
   */
  internals.readPos += internals.chunkSize;

  /**
   * Read the blob as text
   */
  internals.reader.readAsText(blob);
};


/**
 * LineReader#abort
 *
 * Stops the read process
 */
LineReader.prototype.abort = function () {
  this._internals.canRead = false;
};


/**
 * LineReader#_step
 *
 * Internal: gets the next line and emits it as a `line` event
 */
LineReader.prototype._step = function () {
  var internals = this._internals;

  /**
   * If there are no lines left to emit and there is still data left to read,
   * start the read process again, otherwise, emit the 'end' event
   */
  if (internals.lines.length === 0) {
    if ( this._hasMoreData() ) {
      return this.read();
    }
    return this._emit('end');
  }

  /**
   * If the reading process hasn't been aborted, emit the first element of the
   * line array, and pass in '_step' for the user to call when they are ready
   * for the next line. We have to bind '_step' to 'this', otherwise it will be
   * in the wrong scope when the use calls it
   */
  if (internals.canRead) {
    this._emit('line', [
      internals.lines.shift(),
      this._step.bind(this)
    ]);
  } else {
    /**
     * If we can't read, emit the 'end' event
     */
    this._emit('end');
  }
};


/**
 * LineReader#_hasMoreData
 *
 * Internal: determines if there is still more data to read.
 */
LineReader.prototype._hasMoreData = function () {
  var internals = this._internals;
  return internals.readPos <= internals.fileLength;
};

/**
 * LineReader#_emit
 *
 * Internal: handles event emissions
 *
 * @param  {String} event -- The event name to emit
 * @param  {Array} args -- An array of arguments to send to the event callback
 */
LineReader.prototype._emit = function (event, args) {
  var boundEvents = this._internals.events;

  /**
   * if the user has bound the requested event
   */
  if ( typeof boundEvents[event] === 'function' ) {
    /**
     * Use apply to ensure correct scope, and pass in the 'args' array to
     * be used as arguments for the callback
     */
    boundEvents[event].apply(this, args);
  }
};
