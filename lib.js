// Generated by CoffeeScript 1.7.1
(function() {
  var CombinedStream, DEFLATE_END, DeflateCRC32Stream, GZIP_HEADER, crcUtils, _;

  _ = require('lodash');

  crcUtils = require('crc-utils');

  CombinedStream = require('combined-stream');

  DeflateCRC32Stream = require('crc32-stream').DeflateCRC32Stream;

  GZIP_HEADER = new Buffer([0x1f, 0x8b, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xff]);

  DEFLATE_END = new Buffer([0x03, 0x00]);

  exports.createDeflatePart = function() {
    var compress;
    compress = new DeflateCRC32Stream();
    compress.end = function() {
      return compress.flush(function() {
        return compress.emit('end');
      });
    };
    compress.metadata = function() {
      return {
        crc: this.digest(),
        len: this.size(),
        zLen: this.size(true)
      };
    };
    return compress;
  };

  exports.createGzipFromParts = function(parts) {
    var len, out, stream, _i, _len;
    out = CombinedStream.create();
    out.append(GZIP_HEADER);
    for (_i = 0, _len = parts.length; _i < _len; _i++) {
      stream = parts[_i].stream;
      out.append(stream);
    }
    out.append(DEFLATE_END);
    out.append(crcUtils.crc32_combine_multi(parts).combinedCrc32.slice(0, 4));
    len = new Buffer(4);
    len.writeUInt32LE(_.sum(_.pluck(parts, 'len')), 0);
    out.append(len);
    out.zLen = _.sum(_.pluck(parts, 'zLen')) + 20;
    return out;
  };

}).call(this);
