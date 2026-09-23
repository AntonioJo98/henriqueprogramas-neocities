import test from 'node:test';
import assert from 'node:assert/strict';
import { createCalculator, input, calculate } from '../site/projects/calculator/calculator-engine.mjs';

test('calculator builds a decimal expression from inputs',()=>{let s=createCalculator();for(const k of ['1','2','+','3'])s=input(s,k);assert.equal(s.expression,'12+3')});
test('calculator evaluates arithmetic and adds a history item',()=>{let s=createCalculator();for(const k of ['8','/','2'])s=input(s,k);s=calculate(s);assert.equal(s.display,'4');assert.deepEqual(s.history,['8 / 2 = 4'])});
test('calculator reports an invalid divide by zero without adding history',()=>{let s=createCalculator();for(const k of ['1','/','0'])s=input(s,k);s=calculate(s);assert.equal(s.error,'Cannot divide by zero.');assert.deepEqual(s.history,[])});
