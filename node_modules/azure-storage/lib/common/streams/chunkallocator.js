// 
// Copyright (c) Microsoft and contributors.  All rights reserved.
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//   http://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// 
// See the License for the specific language governing permissions and
// limitations under the License.
// 
/**
* Chunked memory pool allocator.
* It could dramatically reduce the memory usage.
* However, it can't dramatically reduce the CPU time since GC in v8 is very efficient.
*/
function ChunkAllocator(chunkSize, maxCount) {
  // Track the unused buffers and number of used buffers
  this._pool = [];
  this._inuse = 0;

  // Buffer size
  this._chunkSize = chunkSize;

  // If total memory is larger than this._chunkSize * this._maxCount, the buffer pool is not used.
  this._maxCount = maxCount || 10;

  // Immediately add a buffer to the pool.
  this._extendMemoryPool();
}

/**
* Synchronously require a buffer
* Caller should be aware of that the content of buffer is random since the Buffer.fill is Time-consumed opreation.
*/
ChunkAllocator.prototype.getBuffer = function(size) {
  var buffer = this._getBufferFromPool(size);
  if (buffer === null) {
    // Either the total memory is larger than this._chunkSize * this._maxCount
    // Or, the size does not match the chunk size of the pool
    buffer = new Buffer(size);
  }

  this._inuse++;
  return buffer;
};

/**
* Get buffer from the current memory pool.
*/
ChunkAllocator.prototype._getBufferFromPool = function(size) {
  // Return null if the given size does not match the chunk size of the buffer pool.
  if(size !== this._chunkSize) {
    return null;
  } 

  // Extend the memory pool if it is empty.
  if(this._pool.length === 0) {
    this._extendMemoryPool();
  }

  // If the pool is not empty, return a buffer.
  if(this._pool.length !== 0) {
    return this._pool.pop();
  } else {
    return null;
  }
};

/**
* Extend the memory pool if the maximum size has not been reached.
*/
ChunkAllocator.prototype._extendMemoryPool = function() {
  var total = this._pool.length + this._inuse;

  // If the total is larger than the max, do not allocate more memory.
  if(total >= this._maxCount) return;

  // Calculate the new number of buffers, equal to the total*2 bounded by 1 and the maxCount
  var nextSize = Math.min(total * 2, this._maxCount) || 1;

  // Add more buffers.
  var increment = nextSize - total;
  for(var i = 0; i < increment; i++) {
    var buffer = new Buffer(this._chunkSize);
    this._pool.push(buffer);
  }
};

/**
* Release the buffer.
*/
ChunkAllocator.prototype.releaseBuffer = function(buffer) {
  if(buffer.length !== this._chunkSize) {
    // Directly delete the buffer if bufferSize is invalid and wait for GC.
    buffer = null;
    return;
  }

  // Add the buffer to the pool if it is not full, otherwise delete it
  if (this._pool.length < this._maxCount) {
    this._pool.push(buffer);
  } else {
    buffer = null;
  }

  // Decrement _inuse 
  this._inuse--;

  // _inuse could be below zero if a buffer is released which was not returned by getBuffer
  if(this._inuse < 0) {
    this._inuse = 0;
  }
};

/**
* Destroy ChunkAllocator.
*/
ChunkAllocator.prototype.destroy = function() {
  this._pool = [];
  this._inuse = 0;
};

module.exports = ChunkAllocator;
