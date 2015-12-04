/* global global */
import chai from 'chai';
import sinon from 'sinon';
import logger from 'winston';
import sinonChai from 'sinon-chai';
import chaithings from 'chai-things';
import Scraper from '../lib/scraper';

import testSite from './fixtures/single-scrape-transform'

chai.should();
chai.use(sinonChai);
chai.use(chaithings);

describe('Scraper', function() {
  this.timeout(15000);

  const sandbox = sinon.sandbox.create({
    useFakeTimers: false,
    useFakeServer: false
  });

  before(function(done) {
    this.scraper = new Scraper(testSite);
    this.scraper.scrape(jobs => {
      this.jobList = jobs;
      done();
    })
  })

  beforeEach(function() {
    sandbox.stub(logger, 'info');
    sandbox.stub(logger, 'debug');
    sandbox.stub(logger, 'error');
  });

  afterEach(function() {
    sandbox.restore();
  });

  //it('should provide an empty array if no transforms are set', function() {
  //  this.scraper.customTransforms.should.deep.equal([]);
  //});

  it('should return results', function() {
    this.jobList.length.should.not.equal(0);
  })

  it('should have an ID on each job returned', function() {
    this.jobList.should.all.have.property('id');
  })



});
