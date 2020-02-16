import { TestBed } from '@angular/core/testing';

import { SoundManagerService } from './sound-manager.service';

describe('SoundManagerService', () => {
  let service: SoundManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SoundManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
