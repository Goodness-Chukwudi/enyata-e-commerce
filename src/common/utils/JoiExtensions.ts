import { Root } from "joi";
import { JoiExtensionFactory } from "../../interfaces/interfaces";

/**
 * A class whose member methods provide extension to Joi validators
*/
class ValidationExtensions {
  /**
   * A Joi extension for validating dates
   * - the extension factory returned by this method, provides custom validation for dates in multiple formats
   * @returns an extension factory function for validating dates
  */
  dateExtension() {
    const hat  = require('@joi/date');
    return require('@joi/date');
  }
}

const JoiExtensions = new ValidationExtensions();
const date = JoiExtensions.dateExtension();

export default JoiExtensions;

export {
  date
}