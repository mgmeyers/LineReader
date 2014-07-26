/**
 * LineReader
 * https://github.com/mgmeyers/LineReader
 *
 * Copyright 2014 Matthew Meyers <hello@matthewmeye.rs>
 * Released under the MIT license:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Reads a file one line at a time. This is especially useful for large files
 * since it only stores small chunks of the file in memory.
 *
 * @param {File} file -- The file object to read
 */
var LineReader = function ( file ) {
  if ( !(this instanceof LineReader) ) {
    return new LineReader( file );
  }

  var internals = this._internals = {};
  var self = this;

  internals.events = {};
  internals.reader = new FileReader();
  internals.canRead = true;

  internals.file = file;
  internals.fileLength = file.size;

  internals.readPos = 0;
  internals.chunkSize = 1024;
  internals.chunk = '';
  internals.lines = [];

  internals.reader.onload = function ( e ) {
    internals.chunk += e.target.result;
    if ( /\n/.test( internals.chunk ) ) {
      internals.lines = internals.chunk.split('\n');
      if ( self._hasMoreData ) {
        internals.chunk = internals.lines.pop();
      }
      self._step();
    }
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
LineReader.prototype.on = function ( eventName, cb ) {
  var internals = this._internals;

  internals.events[ eventName ] = cb;
};


/**
 * LineReader#read
 *
 * Starts the read process
 */
LineReader.prototype.read = function () {
  var internals = this._internals;
  var blob = internals.file.slice( internals.readPos, internals.readPos + internals.chunkSize );

  internals.readPos += internals.chunkSize;

  internals.reader.readAsBinaryString( blob );
};


/**
 * LineReader#stop
 *
 * Stops the read process
 */
LineReader.prototype.stop = function () {
  this._internals.canRead = false;
};


/**
 * LineReader#_step
 *
 * Internal: gets the next line and emits it as a `line` event
 */
LineReader.prototype._step = function () {
  var internals = this._internals;

  if ( internals.lines.length === 0 ) {
    return this.read();
  }

  if ( typeof internals.events.line === 'function' && internals.canRead ) {
    internals.events.line( internals.lines.shift(), this._step.bind(this) );
  }
};


/**
 * LineReader#_hasMoreData
 *
 * Internal: determines if there is still more data to read.
 */
LineReader.prototype._hasMoreData = function () {
  var internals = this._internals;
  return internals.readPos < internals.fileLength;
};
