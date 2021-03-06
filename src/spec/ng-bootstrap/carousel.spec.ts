/* tslint:disable:max-classes-per-file max-file-line-count component-class-suffix */
/**
 * @copyright Angular ng-bootstrap team
 */
import { fakeAsync, discardPeriodicTasks, tick, TestBed, ComponentFixture, inject } from '@angular/core/testing';
import { createGenericTestComponent } from './test/common';

import { By } from '@angular/platform-browser';
import { Component } from '@angular/core';

import { CarouselModule, CarouselComponent, CarouselConfig } from '../../carousel';

const createTestComponent = (html: string) =>
  createGenericTestComponent(html, TestComponent) as ComponentFixture<TestComponent>;

function expectActiveSlides(nativeEl: HTMLDivElement, active: boolean[]): void {
  const slideElms = nativeEl.querySelectorAll('.carousel-item');
  const indicatorElms = nativeEl.querySelectorAll('ol.carousel-indicators > li');

  expect(slideElms.length).toBe(active.length);
  expect(indicatorElms.length).toBe(active.length);

  for (let i = 0; i < active.length; i++) {
    if (active[i]) {
      expect(slideElms[i]).toHaveCssClass('active');
      expect(indicatorElms[i]).toHaveCssClass('active');
    } else {
      expect(slideElms[i]).not.toHaveCssClass('active');
      expect(indicatorElms[i]).not.toHaveCssClass('active');
    }
  }
}

describe('ngb-carousel', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({declarations: [TestComponent], imports: [CarouselModule.forRoot()]});
  });

  it('should initialize inputs with default values', () => {
    const defaultConfig = new CarouselConfig();
    const carousel = new CarouselComponent(new CarouselConfig());

    expect(carousel.interval).toBe(defaultConfig.interval);
    expect(carousel.noWrap).toBe(defaultConfig.noWrap);
    // expect(carousel.keyboard).toBe(defaultConfig.keyboard);
  });

  it('should render slides and navigation indicators', fakeAsync(() => {
    const html = `
      <carousel>
      <slide>slide1</slide>
      <slide>slide2</slide>
    </carousel>
    `;
    const fixture = createTestComponent(html);

    const slideElms = fixture.nativeElement.querySelectorAll('.carousel-item');
    expect(slideElms.length).toBe(2);
    expect(slideElms[0].textContent).toMatch(/slide1/);
    expect(slideElms[1].textContent).toMatch(/slide2/);

    expect(fixture.nativeElement.querySelectorAll('ol.carousel-indicators > li').length).toBe(2);

    discardPeriodicTasks();
  }));

  it('should mark the first slide as active by default', fakeAsync(() => {
    const html = `
      <carousel>
      <slide>slide1</slide>
      <slide>slide2</slide>
    </carousel>
    `;

    const fixture = createTestComponent(html);
    expectActiveSlides(fixture.nativeElement, [true, false]);

    discardPeriodicTasks();
  }));

  it('should mark the requested slide as active', fakeAsync(() => {
    const html = `
      <carousel [activeSlide] = "activeSlideIndex">
        <slide>slide1</slide>
        <slide>slide2</slide>
      </carousel>       
     `;

    const fixture = createTestComponent(html);

    fixture.componentInstance.activeSlideIndex = 1;
    fixture.detectChanges();
    expectActiveSlides(fixture.nativeElement, [false, true]);

    discardPeriodicTasks();
  }));

  it('should auto-correct when slide index is undefined', fakeAsync(() => {
    const html = `
      <carousel [activeSlide] = "doesntExist">
        <slide>slide1</slide>
        <slide>slide2</slide>
      </carousel>
    `;

    const fixture = createTestComponent(html);
    expectActiveSlides(fixture.nativeElement, [true, false]);

    discardPeriodicTasks();
  }));

  it('should change slide on indicator click', fakeAsync(() => {
    const html = `
      <carousel>
        <slide>slide1</slide>
        <slide>slide2</slide>
      </carousel>
    `;

    const fixture = createTestComponent(html);
    const indicatorElms = fixture.nativeElement.querySelectorAll('ol.carousel-indicators > li');

    expectActiveSlides(fixture.nativeElement, [true, false]);

    indicatorElms[1].click();
    fixture.detectChanges();
    expectActiveSlides(fixture.nativeElement, [false, true]);

    discardPeriodicTasks();
  }));

  it('should change slide on carousel control click', fakeAsync(() => {
    const html = `
      <carousel>
        <slide>slide1</slide>
        <slide>slide2</slide>
      </carousel>
    `;

    const fixture = createTestComponent(html);

    const controlElms = fixture.nativeElement.querySelectorAll('.carousel-control');

    expectActiveSlides(fixture.nativeElement, [true, false]);

    controlElms[1].click();  // next
    fixture.detectChanges();
    expectActiveSlides(fixture.nativeElement, [false, true]);

    controlElms[0].click();  // prev
    fixture.detectChanges();
    expectActiveSlides(fixture.nativeElement, [true, false]);

    discardPeriodicTasks();
  }));

  it('should change slide on time passage (default interval value)', fakeAsync(() => {
    const html = `
      <carousel>
        <slide>slide1</slide>
        <slide>slide2</slide>
      </carousel>
    `;

    const fixture = createTestComponent(html);
    expectActiveSlides(fixture.nativeElement, [true, false]);

    tick(6000);
    fixture.detectChanges();
    expectActiveSlides(fixture.nativeElement, [false, true]);

    discardPeriodicTasks();
  }));

  it('should change slide on time passage (custom interval value)', fakeAsync(() => {
    const html = `
      <carousel [interval]="2000">
        <slide>slide1</slide>
        <slide>slide2</slide>
      </carousel>
    `;

    const fixture = createTestComponent(html);

    expectActiveSlides(fixture.nativeElement, [true, false]);

    tick(1000);
    fixture.detectChanges();
    expectActiveSlides(fixture.nativeElement, [true, false]);

    tick(1200);
    fixture.detectChanges();
    expectActiveSlides(fixture.nativeElement, [false, true]);

    discardPeriodicTasks();
  }));

  it('should not change slide on time passage (custom interval value is zero)', fakeAsync(() => {
    const html = `
      <carousel [interval]="0">
        <slide>slide1</slide>
        <slide>slide2</slide>
      </carousel>
    `;

    const fixture = createTestComponent(html);

    expectActiveSlides(fixture.nativeElement, [true, false]);

    tick(1000);
    fixture.detectChanges();
    expectActiveSlides(fixture.nativeElement, [true, false]);

    tick(1200);
    fixture.detectChanges();
    expectActiveSlides(fixture.nativeElement, [true, false]);

    discardPeriodicTasks();
  }));

  it('should pause / resume slide change with time passage on mouse enter / leave', fakeAsync(() => {
    const html = `
      <carousel>
        <slide>slide1</slide>
        <slide>slide2</slide>
      </carousel>
    `;

    const fixture = createTestComponent(html);

    const carouselDebugEl = fixture.debugElement.query(By.directive(CarouselComponent));

    expectActiveSlides(fixture.nativeElement, [true, false]);

    carouselDebugEl.children[0].triggerEventHandler('mouseenter', {});
    fixture.detectChanges();
    expectActiveSlides(fixture.nativeElement, [true, false]);

    tick(6000);
    fixture.detectChanges();
    expectActiveSlides(fixture.nativeElement, [true, false]);

    carouselDebugEl.children[0].triggerEventHandler('mouseleave', {});
    fixture.detectChanges();
    expectActiveSlides(fixture.nativeElement, [true, false]);

    tick(6000);
    fixture.detectChanges();
    expectActiveSlides(fixture.nativeElement, [false, true]);
    discardPeriodicTasks();
  }));

  it('should wrap slide changes by default', fakeAsync(() => {
    const html = `
      <carousel>
        <slide>slide1</slide>
        <slide>slide2</slide>
      </carousel>
    `;

    const fixture = createTestComponent(html);

    const controlElms = fixture.nativeElement.querySelectorAll('.carousel-control');

    expectActiveSlides(fixture.nativeElement, [true, false]);

    controlElms[1].click();  // next
    fixture.detectChanges();
    expectActiveSlides(fixture.nativeElement, [false, true]);

    controlElms[1].click();  // next
    fixture.detectChanges();
    expectActiveSlides(fixture.nativeElement, [true, false]);

    controlElms[0].click();  // prev
    fixture.detectChanges();
    expectActiveSlides(fixture.nativeElement, [false, true]);

    discardPeriodicTasks();
  }));

  it('should not wrap slide changes by when requested', fakeAsync(() => {
    const html = `
      <carousel [noWrap]="true">
        <slide>slide1</slide>
        <slide>slide2</slide>
      </carousel>
    `;

    const fixture = createTestComponent(html);

    const controlElms = fixture.nativeElement.querySelectorAll('.carousel-control');

    expectActiveSlides(fixture.nativeElement, [true, false]);

    controlElms[0].click();  // prev
    fixture.detectChanges();
    expectActiveSlides(fixture.nativeElement, [true, false]);

    controlElms[1].click();  // next
    fixture.detectChanges();
    expectActiveSlides(fixture.nativeElement, [false, true]);

    controlElms[1].click();  // next
    fixture.detectChanges();
    expectActiveSlides(fixture.nativeElement, [false, true]);

    discardPeriodicTasks();
  }));

  xit('should change on key arrowRight and arrowLeft', fakeAsync(() => {
    const html = `
      <carousel [noWrap]="true" [keyboard]="keyboard">
        <slide>slide1</slide>
        <slide>slide2</slide>
      </carousel>
    `;

    const fixture = createTestComponent(html);
    expectActiveSlides(fixture.nativeElement, [true, false]);

    fixture.debugElement.query(By.directive(CarouselComponent)).triggerEventHandler('keydown.arrowRight', {});  // next()
    fixture.detectChanges();
    expectActiveSlides(fixture.nativeElement, [false, true]);

    fixture.debugElement.query(By.directive(CarouselComponent)).triggerEventHandler('keydown.arrowLeft', {});  // prev()
    fixture.detectChanges();
    expectActiveSlides(fixture.nativeElement, [true, false]);

    fixture.componentInstance.keyboard = false;
    fixture.detectChanges();
    fixture.debugElement.query(By.directive(CarouselComponent)).triggerEventHandler('keydown.arrowRight', {});  // prev()
    fixture.detectChanges();
    expectActiveSlides(fixture.nativeElement, [true, false]);

    discardPeriodicTasks();

  }));

  xit('should listen to keyevents based on keyboard attribute', fakeAsync(() => {
    const html = `
      <carousel [keyboard]="keyboard">
        <slide>slide1</slide>
        <slide>slide2</slide>
      </carousel>
    `;

    const fixture = createTestComponent(html);
    expectActiveSlides(fixture.nativeElement, [true, false]);

    fixture.componentInstance.keyboard = false;
    fixture.detectChanges();
    fixture.debugElement.query(By.directive(CarouselComponent)).triggerEventHandler('keydown.arrowRight', {});  // prev()
    fixture.detectChanges();
    expectActiveSlides(fixture.nativeElement, [true, false]);

    fixture.componentInstance.keyboard = true;
    fixture.detectChanges();
    fixture.debugElement.query(By.directive(CarouselComponent)).triggerEventHandler('keydown.arrowRight', {});  // next()
    fixture.detectChanges();
    expectActiveSlides(fixture.nativeElement, [false, true]);

    discardPeriodicTasks();

  }));

  describe('Custom config', () => {
    let config: CarouselConfig;

    beforeEach(() => { TestBed.configureTestingModule({imports: [CarouselModule.forRoot()]}); });

    beforeEach(inject([CarouselConfig], (c: CarouselConfig) => {
      config = c;
      config.interval = 1000;
      config.noWrap = true;
      // config.keyboard = false;
    }));

    it('should initialize inputs with provided config', () => {
      const fixture = TestBed.createComponent(CarouselComponent);
      fixture.detectChanges();

      const carousel = fixture.componentInstance;
      expect(carousel.interval).toBe(config.interval);
      expect(carousel.noWrap).toBe(config.noWrap);
      // expect(carousel.keyboard).toBe(config.keyboard);
    });
  });

  describe('Custom config as provider', () => {
    const config = new CarouselConfig();
    config.interval = 1000;
    config.noWrap = true;
    // config.keyboard = false;

    beforeEach(() => {
      TestBed.configureTestingModule(
        {imports: [CarouselModule.forRoot()], providers: [{provide: CarouselConfig, useValue: config}]});
    });

    it('should initialize inputs with provided config as provider', () => {
      const fixture = TestBed.createComponent(CarouselComponent);
      fixture.detectChanges();

      const carousel = fixture.componentInstance;
      expect(carousel.interval).toBe(config.interval);
      expect(carousel.noWrap).toBe(config.noWrap);
      // expect(carousel.keyboard).toBe(config.keyboard);
    });
  });

});

@Component({selector: 'test-cmp', template: ''})
class TestComponent {
  public activeSlideIndex: number;
  // keyboard = true;
}
