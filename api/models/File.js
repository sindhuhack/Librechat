const mongoose = require('mongoose');
const fileSchema = require('./schema/fileSchema');

const File = mongoose.model('File', fileSchema);

/**
 * Finds a file by its file_id.
 * @param {string} file_id - The unique identifier of the file.
 * @returns {Promise<MongoFile>} A promise that resolves to the file document or null.
 */
const findFileById = async (file_id) => {
  return await File.findOne({ file_id }).lean();
};

/**
 * Retrieves files matching a given filter.
 * @param {Object} filter - The filter criteria to apply.
 * @returns {Promise<Array<MongoFile>>} A promise that resolves to an array of file documents.
 */
const getFiles = async (filter) => {
  return await File.find(filter).lean();
};

/**
 * Updates a file identified by file_id with new data.
 * @param {Object} data - The data to update, must contain file_id.
 * @param {boolean} [setTTL=false] - Whether to set the expiresAt field to the current time.
 * @returns {Promise<MongoFile>} A promise that resolves to the updated file document.
 */
const createOrUpdateFile = async (data, setTTL = false) => {
  const { file_id, ...update } = data;
  if (setTTL) {
    // Set to expire in 10 minutes
    update.expiresAt = new Date(new Date().getTime() + 10 * 60000);
  }
  return await File.findOneAndUpdate({ file_id }, update, { new: true, upsert: true }).lean();
};

/**
 * Deletes a file identified by file_id.
 * @param {string} file_id - The unique identifier of the file to delete.
 * @returns {Promise<MongoFile>} A promise that resolves to the deleted file document or null.
 */
const deleteFile = async (file_id) => {
  return await File.findOneAndDelete({ file_id }).lean();
};

module.exports = {
  File,
  findFileById,
  getFiles,
  createOrUpdateFile,
  deleteFile,
};
