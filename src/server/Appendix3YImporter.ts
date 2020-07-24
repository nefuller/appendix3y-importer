import { Appendix3YInfo } from "../shared/Appendix3YInfo";
import { logger } from "./Logger";

const APPENDIX3Y_FIELDS = {
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

export default class Appendix3YImporter {
  public getAppendix3YInfo(info: any, data: string): Appendix3YInfo {
    const lines = data.split(/[\r\n]+/).filter(e => e.trim());
  
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
  
      if (line.includes(APPENDIX3Y_FIELDS.ENTITY)) {
        info.entity = this.sanitize(this.getAppendix3YValue(lines, i, APPENDIX3Y_FIELDS.ENTITY, APPENDIX3Y_FIELDS.ABN));
  
      } else if (line.includes(APPENDIX3Y_FIELDS.ABN)) {
        info.abn = this.sanitize(this.getAppendix3YValue(lines, i, APPENDIX3Y_FIELDS.ABN, APPENDIX3Y_FIELDS.NAME));
  
      } else if (line.includes(APPENDIX3Y_FIELDS.NAME)) {
        info.name = this.sanitize(this.getAppendix3YValue(lines, i, APPENDIX3Y_FIELDS.NAME, APPENDIX3Y_FIELDS.DATE_OF_LAST_NOTICE));
  
      } else if (line.includes(APPENDIX3Y_FIELDS.DATE_OF_LAST_NOTICE)) {
        info.dateOfLastNotice = new Date(this.sanitize(this.getAppendix3YValue(lines, i, APPENDIX3Y_FIELDS.DATE_OF_LAST_NOTICE, APPENDIX3Y_FIELDS.NATURE_OF_INTEREST)));
  
      } else if (line.includes(APPENDIX3Y_FIELDS.NATURE_OF_INTEREST)) {
        info.isIndirectInterest = this.sanitize(this.getAppendix3YValue(lines, i, APPENDIX3Y_FIELDS.NATURE_OF_INTEREST, APPENDIX3Y_FIELDS.NATURE_OF_INDIRECT_INTEREST)).toUpperCase().includes('INDIRECT');
  
      } else if (info.isIndirectInterest && line.includes(APPENDIX3Y_FIELDS.NATURE_OF_INDIRECT_INTEREST)) {
        info.indirectInterestDescription = this.getAppendix3YValue(lines, i, APPENDIX3Y_FIELDS.NATURE_OF_INDIRECT_INTEREST, APPENDIX3Y_FIELDS.DATE_OF_CHANGE);
  
      } else if (line.includes(APPENDIX3Y_FIELDS.DATE_OF_CHANGE)) {
        info.dateOfChange = new Date(this.sanitize(this.getAppendix3YValue(lines, i, APPENDIX3Y_FIELDS.DATE_OF_CHANGE, APPENDIX3Y_FIELDS.SECURITIES_PREV_HELD)));
  
      } else if (line.includes(APPENDIX3Y_FIELDS.SECURITIES_PREV_HELD)) {
        info.numSecuritiesPrevHeld = this.parseNilNoneOrNumericValue(this.getAppendix3YValue(lines, i, APPENDIX3Y_FIELDS.SECURITIES_PREV_HELD, APPENDIX3Y_FIELDS.SECURITY_CLASS));
  
      } else if (line.includes(APPENDIX3Y_FIELDS.SECURITY_CLASS)) {
        info.securityClass = this.sanitize(this.getAppendix3YValue(lines, i, APPENDIX3Y_FIELDS.SECURITY_CLASS, APPENDIX3Y_FIELDS.SECURITIES_AQUIRED));
  
      } else if (line.includes(APPENDIX3Y_FIELDS.SECURITIES_AQUIRED)) {
        info.numSecuritiesAcquired = this.parseNilNoneOrNumericValue(this.getAppendix3YValue(lines, i, APPENDIX3Y_FIELDS.SECURITIES_AQUIRED, APPENDIX3Y_FIELDS.SECURITIES_DISPOSED));
  
      } else if (line.includes(APPENDIX3Y_FIELDS.SECURITIES_DISPOSED)) {
        info.numSecuritiesDisposed = this.parseNilNoneOrNumericValue(this.getAppendix3YValue(lines, i, APPENDIX3Y_FIELDS.SECURITIES_DISPOSED, APPENDIX3Y_FIELDS.VALUE));
  
      } else if (line.includes(APPENDIX3Y_FIELDS.VALUE)) {
        info.value = this.sanitize(this.getAppendix3YValue(lines, i, APPENDIX3Y_FIELDS.VALUE, APPENDIX3Y_FIELDS.SECURITIES_CURR_HELD));
  
      } else if (line.includes(APPENDIX3Y_FIELDS.SECURITIES_CURR_HELD)) {
        info.numSecuritiesCurrHeld = this.sanitize(this.getAppendix3YValue(lines, i, APPENDIX3Y_FIELDS.SECURITIES_CURR_HELD, APPENDIX3Y_FIELDS.NATURE_OF_CHANGE));
  
      } else if (line.includes(APPENDIX3Y_FIELDS.NATURE_OF_CHANGE)) {
        info.natureOfChange = this.sanitize(this.getAppendix3YValue(lines, i, APPENDIX3Y_FIELDS.NATURE_OF_CHANGE, null));
      }
    }
  
    logger.info(JSON.stringify(info, null, 2));
    return info as Appendix3YInfo;
  }
  
  getAppendix3YValue(lines: string[], startIndex: number, startKey: string, endKey: string) {
    const split = lines[startIndex].split(startKey);
    if (split.length > 1 && split[1] !== '') {
      return split[1];
    } else {
      let value = '';
  
      for (let i = startIndex + 1; i < lines.length; i++) {
        const line = lines[i];
  
        if (line.includes(endKey)) {
          break;
        } else {
          value = value.concat(line, ' ');
        }
      }
  
      return value.trim();
    }
  }

  parseNilNoneOrNumericValue(line: string): number {
    return line.includes('Nil') ||  line.includes('None') ? 0 : parseFloat(this.sanitize(line));
  }
  
  sanitize(value: string): string {
    return value.replace(/[^a-zA-Z0-9$<>\\ -]/g, "").trim();
  }
  
}