import { TestBed } from '@angular/core/testing';

import { TinderService } from './tinder-service';

describe('TinderService', () => {
  let service: TinderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TinderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
