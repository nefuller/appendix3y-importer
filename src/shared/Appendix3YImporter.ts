import { Appendix3YInfo } from './Appendix3YInfo';

// The fields of the Appendix 3Y form that we want to detect.
const FORM_FIELD = {
  ENTITY:               'Name of entity',
  ABN:                  'ABN',
  NAME:                 'Name of Director',
  DATE_OF_LAST_NOTICE:  'Date of last notice',
  DATE_OF_CHANGE:       'Date of change',
  NATURE_OF_CHANGE:     'Nature of change',
  NATURE_OF_INTEREST:   'Direct or indirect interest',
  NATURE_OF_INDIRECT_INTEREST: 'Nature of indirect interest',
  SECURITIES_PREV_HELD: 'No. of securities held prior to change',
  SECURITIES_AQUIRED:   'Number acquired',
  SECURITIES_DISPOSED:  'Number disposed',
  SECURITIES_CURR_HELD: 'No. of securities held after change',
  SECURITY_CLASS:       'Class',
  VALUE:                'Value/Consideration'
};

/*
*  This class provides functionality for extracting Appendix 3Y information from the text returned by Tesseract.
*/
export default class Appendix3YImporter {
  /*
  * Extracts Appendix3YInfo data from the input string.
  *
  * @param data - the string to extract data from
  * @returns - an instance of Appendix3YInfo
  */
  public getAppendix3YInfo(data: string): Appendix3YInfo {
    const info: any = {};

    const lines = data.split(/[\r\n]+/).filter(e => e.trim());
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.includes(FORM_FIELD.ENTITY)) {
        info.entity = this.sanitize(this.getAppendix3YValue(lines, i, FORM_FIELD.ENTITY, FORM_FIELD.ABN));
  
      } else if (line.includes(FORM_FIELD.ABN)) {
        info.abn = this.sanitize(this.getAppendix3YValue(lines, i, FORM_FIELD.ABN, FORM_FIELD.NAME));
  
      } else if (line.includes(FORM_FIELD.NAME)) {
        info.name = this.sanitize(this.getAppendix3YValue(lines, i, FORM_FIELD.NAME, FORM_FIELD.DATE_OF_LAST_NOTICE));
  
      } else if (line.includes(FORM_FIELD.DATE_OF_LAST_NOTICE)) {
        info.dateOfLastNotice = new Date(this.sanitize(this.getAppendix3YValue(lines, i, FORM_FIELD.DATE_OF_LAST_NOTICE, FORM_FIELD.NATURE_OF_INTEREST)));
  
      } else if (line.includes(FORM_FIELD.NATURE_OF_INTEREST)) {
        info.isIndirectInterest = this.sanitize(this.getAppendix3YValue(lines, i, FORM_FIELD.NATURE_OF_INTEREST, FORM_FIELD.NATURE_OF_INDIRECT_INTEREST)).toUpperCase().includes('INDIRECT');
  
      } else if (info.isIndirectInterest && line.includes(FORM_FIELD.NATURE_OF_INDIRECT_INTEREST)) {
        info.indirectInterestDescription = this.getAppendix3YValue(lines, i, FORM_FIELD.NATURE_OF_INDIRECT_INTEREST, FORM_FIELD.DATE_OF_CHANGE);
  
      } else if (line.includes(FORM_FIELD.DATE_OF_CHANGE)) {
        info.dateOfChange = new Date(this.sanitize(this.getAppendix3YValue(lines, i, FORM_FIELD.DATE_OF_CHANGE, FORM_FIELD.SECURITIES_PREV_HELD)));
  
      } else if (line.includes(FORM_FIELD.SECURITIES_PREV_HELD)) {
        info.numSecuritiesPrevHeld = this.parseNilNoneOrNumericValue(this.getAppendix3YValue(lines, i, FORM_FIELD.SECURITIES_PREV_HELD, FORM_FIELD.SECURITY_CLASS));
  
      } else if (line.includes(FORM_FIELD.SECURITY_CLASS)) {
        info.securityClass = this.sanitize(this.getAppendix3YValue(lines, i, FORM_FIELD.SECURITY_CLASS, FORM_FIELD.SECURITIES_AQUIRED));
  
      } else if (line.includes(FORM_FIELD.SECURITIES_AQUIRED)) {
        info.numSecuritiesAcquired = this.parseNilNoneOrNumericValue(this.getAppendix3YValue(lines, i, FORM_FIELD.SECURITIES_AQUIRED, FORM_FIELD.SECURITIES_DISPOSED));
  
      } else if (line.includes(FORM_FIELD.SECURITIES_DISPOSED)) {
        info.numSecuritiesDisposed = this.parseNilNoneOrNumericValue(this.getAppendix3YValue(lines, i, FORM_FIELD.SECURITIES_DISPOSED, FORM_FIELD.VALUE));
  
      } else if (line.includes(FORM_FIELD.VALUE)) {
        info.value = this.sanitize(this.getAppendix3YValue(lines, i, FORM_FIELD.VALUE, FORM_FIELD.SECURITIES_CURR_HELD));
  
      } else if (line.includes(FORM_FIELD.SECURITIES_CURR_HELD)) {
        info.numSecuritiesCurrHeld = this.sanitize(this.getAppendix3YValue(lines, i, FORM_FIELD.SECURITIES_CURR_HELD, FORM_FIELD.NATURE_OF_CHANGE));
  
      } else if (line.includes(FORM_FIELD.NATURE_OF_CHANGE)) {
        info.natureOfChange = this.sanitize(this.getAppendix3YValue(lines, i, FORM_FIELD.NATURE_OF_CHANGE, null));
      }
    }
  
    return info as Appendix3YInfo;
  }
  
  /*
  * Reads an Appendix3Y value.
  * @remarks
  * 
  * The data for a particular field may be on the same line, or spread over the following several lines. This function handles
  * both situations.
  * 
  * @param lines - an array of Appendix3Y data
  * @param startIndex - index into the input array of the string in which startKey is present
  * @param startKey - the start key
  * @param endKey - the end key
  * @returns - a string containing the value of the field indicated by startKey
  */
  getAppendix3YValue(lines: string[], startIndex: number, startKey: string, endKey: string): string {
    const split = lines[startIndex].split(startKey);
    if (split.length > 1 && split[1] !== '') {
      // Value is on the same line as startKey.
      return split[1];
    } else {
      // Value is on the next line, or several lines.
      let value = '';
      for (let i = startIndex + 1; i < lines.length; i++) {
        const line = lines[i];
  
        if (line.includes(endKey)) {
          break;
        } else {
          // Add this line to the final value, with a space inbetween.
          value = value.concat(line, ' ');
        }
      }
  
      return value.trim();
    }
  }

  /*
  * Parses 'Nil' and 'None' and text representations of numbers into actual numbers.
  *
  * @param value - the string value to parse
  * @returns - 0 if input was 'Nil' or 'None', otherwise the number represented by the string
  */
  parseNilNoneOrNumericValue(value: string): number {
    return value.includes('Nil') ||  value.includes('None') ? 0 : parseFloat(this.sanitize(value));
  }
  
  
  /*
  * Removes characters we know we are not interested in from the input string.
  *
  * @param value - the string to sanitize
  * @returns - the sanitized string
  */
  sanitize(value: string): string {
    return value.replace(/[^a-zA-Z0-9$<>\\ -]/g, "").trim();
  }
}
