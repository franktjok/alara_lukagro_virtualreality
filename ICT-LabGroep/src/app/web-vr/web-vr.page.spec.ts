import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WebVRPage } from './web-vr.page';

describe('WebVRPage', () => {
  let component: WebVRPage;
  let fixture: ComponentFixture<WebVRPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WebVRPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WebVRPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
