import BigNumber from 'bignumber.js';

// utils
import formatCurrencyUnit from './formatCurrencyUnit';

interface ITestParams {
  input: BigNumber;
  expected: string;
}

describe('formatCurrencyUnit()', () => {
  it.each([
    {
      input: new BigNumber('1125612290.716271'),
      expected: '1.12561b',
    },
    {
      input: new BigNumber('3200020892.716271'),
      expected: '3.20002b',
    },
    {
      input: new BigNumber('1000020892.716271'),
      expected: '1.00002b',
    },
    {
      input: new BigNumber('1000000892.716271'),
      expected: '1b',
    },
    {
      input: new BigNumber('5612290.716271'),
      expected: '5.61229m',
    },
    {
      input: new BigNumber('999999.999999'),
      expected: '1m',
    },
    {
      input: new BigNumber('999999.990000'),
      expected: '999,999.99',
    },
    {
      input: new BigNumber('612290.716271'),
      expected: '612,290.72',
    },
    {
      input: new BigNumber('12290.716271'),
      expected: '12,290.72',
    },
    {
      input: new BigNumber('1290.716271'),
      expected: '1,290.72',
    },
    {
      input: new BigNumber('390.716271'),
      expected: '390.72',
    },
    {
      input: new BigNumber('10.742000'),
      expected: '10.74',
    },
    {
      input: new BigNumber('1.800000'),
      expected: '1.8',
    },
    {
      input: new BigNumber('1'),
      expected: '1',
    },
    {
      input: new BigNumber('0.99000'),
      expected: '0.99',
    },
    {
      input: new BigNumber('0.16500'),
      expected: '0.165',
    },
    {
      input: new BigNumber('0.716271'),
      expected: '0.716271',
    },
  ])(
    `should format the unit of $input to $expected`,
    ({ input, expected }: ITestParams) => {
      expect(formatCurrencyUnit(input)).toBe(expected);
    }
  );
});
