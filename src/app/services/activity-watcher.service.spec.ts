import { TestBed } from '@angular/core/testing';

import { ActivityWatcherService } from './activity-watcher.service';

describe('ActivityWatcherService', () => {
  let service: ActivityWatcherService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ActivityWatcherService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
