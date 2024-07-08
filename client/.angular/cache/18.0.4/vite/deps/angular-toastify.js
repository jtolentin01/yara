import {
  CommonModule,
  NgForOf,
  NgIf,
  NgSwitch,
  NgSwitchCase
} from "./chunk-CMGSWFNR.js";
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostListener,
  Injectable,
  Input,
  NgModule,
  NgZone,
  Output,
  ViewChild,
  setClassMetadata,
  ɵɵNgOnChangesFeature,
  ɵɵadvance,
  ɵɵclassMap,
  ɵɵclassMapInterpolate1,
  ɵɵdefineComponent,
  ɵɵdefineInjectable,
  ɵɵdefineInjector,
  ɵɵdefineNgModule,
  ɵɵdirectiveInject,
  ɵɵelement,
  ɵɵelementEnd,
  ɵɵelementStart,
  ɵɵgetCurrentView,
  ɵɵlistener,
  ɵɵloadQuery,
  ɵɵnextContext,
  ɵɵproperty,
  ɵɵqueryRefresh,
  ɵɵresetView,
  ɵɵresolveDocument,
  ɵɵrestoreView,
  ɵɵstyleProp,
  ɵɵtemplate,
  ɵɵtext,
  ɵɵtextInterpolate,
  ɵɵviewQuery
} from "./chunk-6XTMT33O.js";
import "./chunk-MOY5LPCH.js";
import "./chunk-MJQNUHK2.js";
import {
  Subject
} from "./chunk-SAI3DHVA.js";
import "./chunk-B2KS57BG.js";

// node_modules/angular-toastify/fesm2015/angular-toastify.js
var _c0 = ["progressBar"];
var _c1 = ["progressBarCover"];
function ToastifyToastComponent_span_2_i_1_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementStart(0, "i", 11);
    ɵɵtext(1, "info_outline");
    ɵɵelementEnd();
  }
}
function ToastifyToastComponent_span_2_i_2_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementStart(0, "i", 11);
    ɵɵtext(1, "info_outline");
    ɵɵelementEnd();
  }
}
function ToastifyToastComponent_span_2_i_3_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementStart(0, "i", 11);
    ɵɵtext(1, "warning_outline");
    ɵɵelementEnd();
  }
}
function ToastifyToastComponent_span_2_i_4_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementStart(0, "i", 11);
    ɵɵtext(1, "error_outline");
    ɵɵelementEnd();
  }
}
function ToastifyToastComponent_span_2_i_5_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementStart(0, "i", 11);
    ɵɵtext(1, "done");
    ɵɵelementEnd();
  }
}
function ToastifyToastComponent_span_2_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementStart(0, "span", 9);
    ɵɵtemplate(1, ToastifyToastComponent_span_2_i_1_Template, 2, 0, "i", 10)(2, ToastifyToastComponent_span_2_i_2_Template, 2, 0, "i", 10)(3, ToastifyToastComponent_span_2_i_3_Template, 2, 0, "i", 10)(4, ToastifyToastComponent_span_2_i_4_Template, 2, 0, "i", 10)(5, ToastifyToastComponent_span_2_i_5_Template, 2, 0, "i", 10);
    ɵɵelementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = ɵɵnextContext();
    ɵɵproperty("ngSwitch", ctx_r0.toast.type);
    ɵɵadvance();
    ɵɵproperty("ngSwitchCase", ctx_r0.ToastType.info);
    ɵɵadvance();
    ɵɵproperty("ngSwitchCase", ctx_r0.ToastType.default);
    ɵɵadvance();
    ɵɵproperty("ngSwitchCase", ctx_r0.ToastType.warning);
    ɵɵadvance();
    ɵɵproperty("ngSwitchCase", ctx_r0.ToastType.error);
    ɵɵadvance();
    ɵɵproperty("ngSwitchCase", ctx_r0.ToastType.success);
  }
}
function ToastifyToastComponent_span_3_i_1_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelement(0, "i", 16);
  }
}
function ToastifyToastComponent_span_3_i_2_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelement(0, "i", 16);
  }
}
function ToastifyToastComponent_span_3_i_3_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelement(0, "i", 17);
  }
}
function ToastifyToastComponent_span_3_i_4_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelement(0, "i", 18);
  }
}
function ToastifyToastComponent_span_3_i_5_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelement(0, "i", 19);
  }
}
function ToastifyToastComponent_span_3_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementStart(0, "span", 9);
    ɵɵtemplate(1, ToastifyToastComponent_span_3_i_1_Template, 1, 0, "i", 12)(2, ToastifyToastComponent_span_3_i_2_Template, 1, 0, "i", 12)(3, ToastifyToastComponent_span_3_i_3_Template, 1, 0, "i", 13)(4, ToastifyToastComponent_span_3_i_4_Template, 1, 0, "i", 14)(5, ToastifyToastComponent_span_3_i_5_Template, 1, 0, "i", 15);
    ɵɵelementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = ɵɵnextContext();
    ɵɵproperty("ngSwitch", ctx_r0.toast.type);
    ɵɵadvance();
    ɵɵproperty("ngSwitchCase", ctx_r0.ToastType.info);
    ɵɵadvance();
    ɵɵproperty("ngSwitchCase", ctx_r0.ToastType.default);
    ɵɵadvance();
    ɵɵproperty("ngSwitchCase", ctx_r0.ToastType.warning);
    ɵɵadvance();
    ɵɵproperty("ngSwitchCase", ctx_r0.ToastType.error);
    ɵɵadvance();
    ɵɵproperty("ngSwitchCase", ctx_r0.ToastType.success);
  }
}
function ToastifyToastComponent_div_9_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelement(0, "div", 20, 0);
  }
  if (rf & 2) {
    const ctx_r0 = ɵɵnextContext();
    ɵɵclassMapInterpolate1("progress-bar progress-bar--", ctx_r0.ToastType[ctx_r0.toast.type], "");
  }
}
function ToastifyToastComponent_div_10_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelement(0, "div", null, 1);
  }
  if (rf & 2) {
    const ctx_r0 = ɵɵnextContext();
    ɵɵclassMapInterpolate1("progress-bar-cover toast--", ctx_r0.ToastType[ctx_r0.toast.type], "");
    ɵɵstyleProp("animation-duration", ctx_r0.autoCloseAfterSpecificChange() + "ms")("animation-play-state", ctx_r0.running ? "running" : "paused");
  }
}
function ToastifyToastContainerComponent_lib_toastify_toast_1_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = ɵɵgetCurrentView();
    ɵɵelementStart(0, "lib-toastify-toast", 1);
    ɵɵlistener("dismissEvent", function ToastifyToastContainerComponent_lib_toastify_toast_1_Template_lib_toastify_toast_dismissEvent_0_listener() {
      const toast_r2 = ɵɵrestoreView(_r1).$implicit;
      const ctx_r2 = ɵɵnextContext();
      return ɵɵresetView(ctx_r2.dismiss(toast_r2));
    });
    ɵɵelementEnd();
  }
  if (rf & 2) {
    const toast_r2 = ctx.$implicit;
    const ctx_r2 = ɵɵnextContext();
    ɵɵclassMap(ctx_r2.getClass(toast_r2));
    ɵɵproperty("autoClose", ctx_r2.autoClose)("autoCloseSuccess", ctx_r2.autoCloseSuccess)("autoCloseError", ctx_r2.autoCloseError)("autoCloseWarn", ctx_r2.autoCloseWarn)("autoCloseInfo", ctx_r2.autoCloseInfo)("toast", toast_r2)("hideProgressBar", ctx_r2.hideProgressBar)("pauseOnHover", ctx_r2.pauseOnHover)("pauseOnVisibilityChange", ctx_r2.pauseOnVisibilityChange)("closeOnClick", ctx_r2.closeOnClick)("iconLibrary", ctx_r2.iconLibrary);
  }
}
var toastIdentitySequence = 0;
var Toast = class {
  constructor(message, type) {
    this.message = message;
    this.type = type;
    this.time = (/* @__PURE__ */ new Date()).getTime();
    this.id = toastIdentitySequence++;
    this.$resetToast = new Subject();
  }
};
var ToastType;
(function(ToastType2) {
  ToastType2[ToastType2["info"] = 0] = "info";
  ToastType2[ToastType2["success"] = 1] = "success";
  ToastType2[ToastType2["warning"] = 2] = "warning";
  ToastType2[ToastType2["error"] = 3] = "error";
  ToastType2[ToastType2["default"] = 4] = "default";
})(ToastType || (ToastType = {}));
var ToastService = class {
  constructor() {
    this.toastAddedEvent = new EventEmitter();
    this.dismissAllEvent = new EventEmitter();
  }
  dismissAll() {
    this.dismissAllEvent.emit();
  }
  info(message) {
    const toast = new Toast(message, ToastType.info);
    this.toastAddedEvent.emit(toast);
  }
  success(message) {
    const toast = new Toast(message, ToastType.success);
    this.toastAddedEvent.emit(toast);
  }
  warn(message) {
    const toast = new Toast(message, ToastType.warning);
    this.toastAddedEvent.emit(toast);
  }
  error(message) {
    const toast = new Toast(message, ToastType.error);
    this.toastAddedEvent.emit(toast);
  }
  default(message) {
    const toast = new Toast(message, ToastType.default);
    this.toastAddedEvent.emit(toast);
  }
};
ToastService.ɵfac = function ToastService_Factory(t) {
  return new (t || ToastService)();
};
ToastService.ɵprov = ɵɵdefineInjectable({
  token: ToastService,
  factory: ToastService.ɵfac,
  providedIn: "root"
});
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(ToastService, [{
    type: Injectable,
    args: [{
      providedIn: "root"
    }]
  }], function() {
    return [];
  }, null);
})();
var ToastifyToastComponent = class {
  constructor(_cd, _zone) {
    this._cd = _cd;
    this._zone = _zone;
    this.autoClose = 5e3;
    this.autoCloseError = void 0;
    this.autoCloseSuccess = void 0;
    this.autoCloseInfo = void 0;
    this.autoCloseWarn = void 0;
    this.hideProgressBar = false;
    this.pauseOnHover = true;
    this.pauseOnVisibilityChange = true;
    this.closeOnClick = true;
    this.dismissEvent = new EventEmitter();
    this.ToastType = ToastType;
    this.running = false;
  }
  ngOnInit() {
    this.autoCloseRemaining = this.autoCloseAfterSpecificChange();
    this.startTime = this.toast.time;
    this.toast.$resetToast.subscribe(() => this.resetToastTimer());
    if (this.handleVisibilityChange && document.visibilityState === "visible") {
      this.startCloseTimer();
    }
    this.triggerProgressBarAnimation();
  }
  triggerProgressBarAnimation() {
    if (this._progressBarAnimation !== void 0) {
      cancelAnimationFrame(this._progressBarAnimation);
    }
    const frame = () => {
      if (this.running) {
        const remainingTime = Math.max(0, this.expectedAutoDismissTime - (/* @__PURE__ */ new Date()).getTime());
        const percentage = 100 - remainingTime / this.autoCloseAfterSpecificChange() * 100;
        this.progressBarCover.nativeElement.style.width = percentage + "%";
        if (percentage <= 0)
          return;
      }
      this._progressBarAnimation = requestAnimationFrame(frame);
    };
    this._progressBarAnimation = requestAnimationFrame(frame);
  }
  ngOnDestroy() {
    var _a, _b;
    if (this._progressBarAnimation) {
      cancelAnimationFrame(this._progressBarAnimation);
      this._progressBarAnimation = void 0;
    }
    this.clearTimerTimeout();
    (_a = this.toast.$resetToast) === null || _a === void 0 ? void 0 : _a.complete();
    this.toast.$resetToast = null;
    (_b = this._$updateTimer) === null || _b === void 0 ? void 0 : _b.complete();
    this._$updateTimer = null;
  }
  startCloseTimer() {
    if (this.running || !this.autoCloseAfterSpecificChange()) {
      return;
    }
    this.running = true;
    this.expectedAutoDismissTime = (/* @__PURE__ */ new Date()).getTime() + this.autoCloseRemaining;
    this.autoDismissTimeout = this._zone.runOutsideAngular(() => setTimeout(() => {
      this._zone.run(() => {
        this.dismissEvent.emit();
        this._cd.markForCheck();
      });
    }, this.autoCloseRemaining));
  }
  autoCloseAfterSpecificChange() {
    const specificAmount = (() => {
      switch (this.toast.type) {
        case ToastType.success:
          return this.autoCloseSuccess;
        case ToastType.error:
          return this.autoCloseError;
        case ToastType.warning:
          return this.autoCloseWarn;
        case ToastType.info:
          return this.autoCloseInfo;
        default:
          return void 0;
      }
    })();
    return specificAmount === void 0 ? this.autoClose : specificAmount;
  }
  pauseCloseTimer() {
    this.running = false;
    this.clearTimerTimeout();
    this.pauseTime = (/* @__PURE__ */ new Date()).getTime();
    const elapsed = this.pauseTime - this.startTime;
    this.autoCloseRemaining = this.autoCloseAfterSpecificChange() - elapsed;
  }
  resetToastTimer() {
    this.clearTimerTimeout();
    this.running = false;
    this.startTime = (/* @__PURE__ */ new Date()).getTime();
    this.autoCloseRemaining = this.autoCloseAfterSpecificChange();
    this.startCloseTimer();
  }
  clearTimerTimeout() {
    if (this.autoDismissTimeout !== void 0) {
      this.expectedAutoDismissTime = void 0;
      clearTimeout(this.autoDismissTimeout);
    }
  }
  handleDismissButtonAction() {
    if (this.closeOnClick) {
      return;
    }
    this.clearTimerTimeout();
    this.dismissEvent.emit();
  }
  handleHostClick() {
    if (this.closeOnClick) {
      this.clearTimerTimeout();
      this.dismissEvent.emit();
    }
  }
  handleMouseEnter() {
    if (this.pauseOnHover) {
      this.pauseCloseTimer();
    }
  }
  handleMouseLeave() {
    if (this.pauseOnHover) {
      this.startCloseTimer();
      this.startTime = (/* @__PURE__ */ new Date()).getTime() + (this.startTime - this.pauseTime);
    }
  }
  handleVisibilityChange() {
    if (!this.pauseOnVisibilityChange) {
      return;
    }
    if (document.visibilityState !== "visible") {
      this.pauseCloseTimer();
      this._cd.detectChanges();
    } else {
      this.startCloseTimer();
    }
  }
};
ToastifyToastComponent.ɵfac = function ToastifyToastComponent_Factory(t) {
  return new (t || ToastifyToastComponent)(ɵɵdirectiveInject(ChangeDetectorRef), ɵɵdirectiveInject(NgZone));
};
ToastifyToastComponent.ɵcmp = ɵɵdefineComponent({
  type: ToastifyToastComponent,
  selectors: [["lib-toastify-toast"]],
  viewQuery: function ToastifyToastComponent_Query(rf, ctx) {
    if (rf & 1) {
      ɵɵviewQuery(_c0, 5);
      ɵɵviewQuery(_c1, 5);
    }
    if (rf & 2) {
      let _t;
      ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx.progressBar = _t.first);
      ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx.progressBarCover = _t.first);
    }
  },
  hostBindings: function ToastifyToastComponent_HostBindings(rf, ctx) {
    if (rf & 1) {
      ɵɵlistener("click", function ToastifyToastComponent_click_HostBindingHandler() {
        return ctx.handleHostClick();
      })("mouseenter", function ToastifyToastComponent_mouseenter_HostBindingHandler() {
        return ctx.handleMouseEnter();
      })("mouseleave", function ToastifyToastComponent_mouseleave_HostBindingHandler() {
        return ctx.handleMouseLeave();
      })("visibilitychange", function ToastifyToastComponent_visibilitychange_HostBindingHandler() {
        return ctx.handleVisibilityChange();
      }, false, ɵɵresolveDocument);
    }
  },
  inputs: {
    autoClose: "autoClose",
    autoCloseError: "autoCloseError",
    autoCloseSuccess: "autoCloseSuccess",
    autoCloseInfo: "autoCloseInfo",
    autoCloseWarn: "autoCloseWarn",
    hideProgressBar: "hideProgressBar",
    pauseOnHover: "pauseOnHover",
    pauseOnVisibilityChange: "pauseOnVisibilityChange",
    closeOnClick: "closeOnClick",
    toast: "toast",
    iconLibrary: "iconLibrary"
  },
  outputs: {
    dismissEvent: "dismissEvent"
  },
  decls: 11,
  vars: 8,
  consts: [["progressBar", ""], ["progressBarCover", ""], ["role", "alert", 1, "toast-body"], [1, "icon-container"], [3, "ngSwitch", 4, "ngIf"], [1, "toast-container"], ["type", "button", "aria-label", "close", 3, "click"], ["style", "opacity: 1;", 3, "class", 4, "ngIf"], [3, "class", "animation-duration", "animation-play-state", 4, "ngIf"], [3, "ngSwitch"], ["class", "material-icons", 4, "ngSwitchCase"], [1, "material-icons"], ["class", "fa fa-info", 4, "ngSwitchCase"], ["class", "fa fa-exclamation-triangle", 4, "ngSwitchCase"], ["class", "fa fa-exclamation", 4, "ngSwitchCase"], ["class", "fa fa-check", 4, "ngSwitchCase"], [1, "fa", "fa-info"], [1, "fa", "fa-exclamation-triangle"], [1, "fa", "fa-exclamation"], [1, "fa", "fa-check"], [2, "opacity", "1"]],
  template: function ToastifyToastComponent_Template(rf, ctx) {
    if (rf & 1) {
      ɵɵelementStart(0, "div", 2)(1, "div", 3);
      ɵɵtemplate(2, ToastifyToastComponent_span_2_Template, 6, 6, "span", 4)(3, ToastifyToastComponent_span_3_Template, 6, 6, "span", 4);
      ɵɵelementEnd();
      ɵɵelementStart(4, "div", 5)(5, "span");
      ɵɵtext(6);
      ɵɵelementEnd()()();
      ɵɵelementStart(7, "button", 6);
      ɵɵlistener("click", function ToastifyToastComponent_Template_button_click_7_listener() {
        return ctx.handleDismissButtonAction();
      });
      ɵɵtext(8, "✖");
      ɵɵelementEnd();
      ɵɵtemplate(9, ToastifyToastComponent_div_9_Template, 2, 3, "div", 7)(10, ToastifyToastComponent_div_10_Template, 2, 7, "div", 8);
    }
    if (rf & 2) {
      ɵɵadvance(2);
      ɵɵproperty("ngIf", ctx.iconLibrary == "material");
      ɵɵadvance();
      ɵɵproperty("ngIf", ctx.iconLibrary == "font-awesome");
      ɵɵadvance(3);
      ɵɵtextInterpolate(ctx.toast.message);
      ɵɵadvance();
      ɵɵclassMapInterpolate1("close-button close-button--", ctx.ToastType[ctx.toast.type], "");
      ɵɵadvance(2);
      ɵɵproperty("ngIf", !ctx.hideProgressBar);
      ɵɵadvance();
      ɵɵproperty("ngIf", !ctx.hideProgressBar);
    }
  },
  dependencies: [NgIf, NgSwitch, NgSwitchCase],
  styles: [".toast[_ngcontent-%COMP%]{position:relative;min-height:64px;box-sizing:border-box;margin-bottom:1rem;padding:8px;border-radius:1px;box-shadow:0 1px 10px 0 rgba(0,0,0,.1),0 2px 15px 0 rgba(0,0,0,.05);display:flex;justify-content:space-between;max-height:800px;overflow:hidden;font-family:sans-serif;cursor:pointer;direction:ltr}.toast--rtl[_ngcontent-%COMP%]{direction:rtl}.toast--default[_ngcontent-%COMP%]{background:#fff;color:#aaa}.toast--info[_ngcontent-%COMP%]{background:#3498db}.toast--success[_ngcontent-%COMP%]{background:#07bc0c}.toast--warning[_ngcontent-%COMP%]{background:#f1c40f}.toast--error[_ngcontent-%COMP%]{background:#e74c3c}.toast-body[_ngcontent-%COMP%]{margin:auto 0;flex:1}@media only screen and (max-width:480px){.toast[_ngcontent-%COMP%]{margin-bottom:0}}.close-button[_ngcontent-%COMP%]{color:#fff;font-weight:700;font-size:14px;background:transparent;outline:none;border:none;padding:0;cursor:pointer;opacity:.7;transition:.3s ease;align-self:flex-start}.close-button--default[_ngcontent-%COMP%]{color:#000;opacity:.3}.close-button[_ngcontent-%COMP%]:focus, .close-button[_ngcontent-%COMP%]:hover{opacity:1}.progress-bar-cover[_ngcontent-%COMP%]{right:0;z-index:100;direction:rtl}.progress-bar[_ngcontent-%COMP%], .progress-bar-cover[_ngcontent-%COMP%]{position:absolute;bottom:0;width:100%;height:5px;transform-origin:left}.progress-bar[_ngcontent-%COMP%]{left:0;z-index:99;opacity:.7;background-color:hsla(0,0%,100%,.7)}.progress-bar--controlled[_ngcontent-%COMP%]{transition:transform .2s}.progress-bar--rtl[_ngcontent-%COMP%]{right:0;left:auto;transform-origin:right}.progress-bar--default[_ngcontent-%COMP%]{background:linear-gradient(90deg,#4cd964,#5ac8fa,#007aff,#34aadc,#5856d6,#ff2d55)}.icon-container[_ngcontent-%COMP%], .toast-body[_ngcontent-%COMP%]{vertical-align:middle}.icon-container[_ngcontent-%COMP%]{display:inline-block;width:25px}.icon-container[_ngcontent-%COMP%]   span[_ngcontent-%COMP%]{margin-right:.5rem;display:inline-block;text-align:center;width:20px}.icon-container[_ngcontent-%COMP%]   span[_ngcontent-%COMP%]   i[_ngcontent-%COMP%]{vertical-align:middle}.fa[_ngcontent-%COMP%], .material-icons[_ngcontent-%COMP%]{font-size:18px}.toast-container[_ngcontent-%COMP%]{display:inline-block;width:calc(100% - 25px);vertical-align:middle}"]
});
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(ToastifyToastComponent, [{
    type: Component,
    args: [{
      // tslint:disable-next-line:component-selector
      selector: "lib-toastify-toast",
      templateUrl: "./toastify-toast.component.html",
      styleUrls: ["./toastify-toast.component.scss"]
      // changeDetection: ChangeDetectionStrategy.OnPush
    }]
  }], function() {
    return [{
      type: ChangeDetectorRef
    }, {
      type: NgZone
    }];
  }, {
    progressBar: [{
      type: ViewChild,
      args: ["progressBar"]
    }],
    progressBarCover: [{
      type: ViewChild,
      args: ["progressBarCover"]
    }],
    autoClose: [{
      type: Input
    }],
    autoCloseError: [{
      type: Input
    }],
    autoCloseSuccess: [{
      type: Input
    }],
    autoCloseInfo: [{
      type: Input
    }],
    autoCloseWarn: [{
      type: Input
    }],
    hideProgressBar: [{
      type: Input
    }],
    pauseOnHover: [{
      type: Input
    }],
    pauseOnVisibilityChange: [{
      type: Input
    }],
    closeOnClick: [{
      type: Input
    }],
    toast: [{
      type: Input
    }],
    iconLibrary: [{
      type: Input
    }],
    dismissEvent: [{
      type: Output
    }],
    handleHostClick: [{
      type: HostListener,
      args: ["click"]
    }],
    handleMouseEnter: [{
      type: HostListener,
      args: ["mouseenter"]
    }],
    handleMouseLeave: [{
      type: HostListener,
      args: ["mouseleave"]
    }],
    handleVisibilityChange: [{
      type: HostListener,
      args: ["document:visibilitychange"]
    }]
  });
})();
var ToastifyToastContainerComponent = class {
  constructor(_toastService, _cd) {
    this._toastService = _toastService;
    this._cd = _cd;
    this.transitionDurations = 400;
    this.position = "top-right";
    this.transition = "bounce";
    this.autoClose = 5e3;
    this.autoCloseError = void 0;
    this.autoCloseSuccess = void 0;
    this.autoCloseInfo = void 0;
    this.autoCloseWarn = void 0;
    this.hideProgressBar = false;
    this.pauseOnHover = true;
    this.pauseOnVisibilityChange = true;
    this.closeOnClick = true;
    this.newestOnTop = false;
    this.preventDuplicates = false;
    this.iconLibrary = "none";
    this.ToastType = ToastType;
    this.toasts = new Array();
    this.toastTransitionDict = {};
  }
  ngOnChanges() {
    this._cd.markForCheck();
  }
  dismiss(toast) {
    this.toastTransitionDict[toast.id] = TransitionState.exiting;
    setTimeout(() => {
      const index = this.toasts.indexOf(toast);
      this.toasts.splice(index, 1);
      this._cd.markForCheck();
    }, this.transitionDurations);
  }
  getClass(toast) {
    let base = `toast toast--${ToastType[toast.type]} `;
    const state = this.toastTransitionDict[toast.id];
    if (state === TransitionState.entering) {
      base += `${this.transition}-enter ${this.transition}-enter--${this.position}`;
    } else if (state === TransitionState.exiting) {
      base += `${this.transition}-exit ${this.transition}-exit--${this.position}`;
    }
    return base;
  }
  ngOnInit() {
    this._toastService.dismissAllEvent.subscribe(() => {
      this.toasts = new Array();
      this._cd.markForCheck();
    });
    this._toastService.toastAddedEvent.subscribe((toast) => this.handleToastAddedEvent(toast));
  }
  handleToastAddedEvent(toast) {
    if (this.preventDuplicates === true) {
      const sameToast = this.toasts.find((existingToast) => existingToast.message === toast.message);
      if (sameToast) {
        sameToast.$resetToast.next();
        this._cd.markForCheck();
        return;
      }
    }
    this.toastTransitionDict[toast.id] = TransitionState.entering;
    setTimeout(() => {
      this.toastTransitionDict[toast.id] = TransitionState.noTransition;
      this._cd.markForCheck();
    }, this.transitionDurations);
    if (this.newestOnTop) {
      this.toasts.unshift(toast);
    } else {
      this.toasts.push(toast);
    }
    this._cd.markForCheck();
  }
};
ToastifyToastContainerComponent.ɵfac = function ToastifyToastContainerComponent_Factory(t) {
  return new (t || ToastifyToastContainerComponent)(ɵɵdirectiveInject(ToastService), ɵɵdirectiveInject(ChangeDetectorRef));
};
ToastifyToastContainerComponent.ɵcmp = ɵɵdefineComponent({
  type: ToastifyToastContainerComponent,
  selectors: [["lib-toastify-toast-container"]],
  inputs: {
    position: "position",
    transition: "transition",
    autoClose: "autoClose",
    autoCloseError: "autoCloseError",
    autoCloseSuccess: "autoCloseSuccess",
    autoCloseInfo: "autoCloseInfo",
    autoCloseWarn: "autoCloseWarn",
    hideProgressBar: "hideProgressBar",
    pauseOnHover: "pauseOnHover",
    pauseOnVisibilityChange: "pauseOnVisibilityChange",
    closeOnClick: "closeOnClick",
    newestOnTop: "newestOnTop",
    preventDuplicates: "preventDuplicates",
    iconLibrary: "iconLibrary"
  },
  features: [ɵɵNgOnChangesFeature],
  decls: 2,
  vars: 4,
  consts: [["style", "animation-fill-mode: both; animation-duration: 0.75s", 3, "class", "autoClose", "autoCloseSuccess", "autoCloseError", "autoCloseWarn", "autoCloseInfo", "toast", "hideProgressBar", "pauseOnHover", "pauseOnVisibilityChange", "closeOnClick", "iconLibrary", "dismissEvent", 4, "ngFor", "ngForOf"], [2, "animation-fill-mode", "both", "animation-duration", "0.75s", 3, "dismissEvent", "autoClose", "autoCloseSuccess", "autoCloseError", "autoCloseWarn", "autoCloseInfo", "toast", "hideProgressBar", "pauseOnHover", "pauseOnVisibilityChange", "closeOnClick", "iconLibrary"]],
  template: function ToastifyToastContainerComponent_Template(rf, ctx) {
    if (rf & 1) {
      ɵɵelementStart(0, "div");
      ɵɵtemplate(1, ToastifyToastContainerComponent_lib_toastify_toast_1_Template, 1, 13, "lib-toastify-toast", 0);
      ɵɵelementEnd();
    }
    if (rf & 2) {
      ɵɵclassMapInterpolate1("toast-container toast-container--", ctx.position, "");
      ɵɵadvance();
      ɵɵproperty("ngForOf", ctx.toasts);
    }
  },
  dependencies: [ToastifyToastComponent, NgForOf],
  styles: [".toast-container[_ngcontent-%COMP%]{z-index:9999;-webkit-transform:translateZ(9999px);position:fixed;padding:4px;width:320px;box-sizing:border-box;color:#fff}.toast-container--top-left[_ngcontent-%COMP%]{top:1em;left:1em}.toast-container--top-center[_ngcontent-%COMP%]{top:1em;left:50%;margin-left:-160px}.toast-container--top-right[_ngcontent-%COMP%]{top:1em;right:1em}.toast-container--bottom-left[_ngcontent-%COMP%]{bottom:1em;left:1em}.toast-container--bottom-center[_ngcontent-%COMP%]{bottom:1em;left:50%;margin-left:-160px}.toast-container--bottom-right[_ngcontent-%COMP%]{bottom:1em;right:1em}@media only screen and (max-width:480px){.toast-container[_ngcontent-%COMP%]{width:100vw;padding:0;left:0;margin:0}.toast-container--top-center[_ngcontent-%COMP%], .toast-container--top-left[_ngcontent-%COMP%], .toast-container--top-right[_ngcontent-%COMP%]{top:0}.toast-container--bottom-center[_ngcontent-%COMP%], .toast-container--bottom-left[_ngcontent-%COMP%], .toast-container--bottom-right[_ngcontent-%COMP%]{bottom:0}.toast-container--rtl[_ngcontent-%COMP%]{right:0;left:auto}}.toast[_ngcontent-%COMP%]{position:relative;min-height:64px;box-sizing:border-box;margin-bottom:1rem;padding:8px;border-radius:1px;box-shadow:0 1px 10px 0 rgba(0,0,0,.1),0 2px 15px 0 rgba(0,0,0,.05);display:flex;justify-content:space-between;max-height:800px;overflow:hidden;font-family:sans-serif;cursor:pointer;direction:ltr}.toast--rtl[_ngcontent-%COMP%]{direction:rtl}.toast--default[_ngcontent-%COMP%]{background:#fff;color:#aaa}.toast--info[_ngcontent-%COMP%]{background:#3498db}.toast--success[_ngcontent-%COMP%]{background:#07bc0c}.toast--warning[_ngcontent-%COMP%]{background:#f1c40f}.toast--error[_ngcontent-%COMP%]{background:#e74c3c}.toast-body[_ngcontent-%COMP%]{margin:auto 0;flex:1}@media only screen and (max-width:480px){.toast[_ngcontent-%COMP%]{margin-bottom:0}}@keyframes _ngcontent-%COMP%_bounceInRight{0%,60%,75%,90%,to{animation-timing-function:cubic-bezier(.215,.61,.355,1)}0%{opacity:0;transform:translate3d(3000px,0,0)}60%{opacity:1;transform:translate3d(-25px,0,0)}75%{transform:translate3d(10px,0,0)}90%{transform:translate3d(-5px,0,0)}to{transform:none}}@keyframes _ngcontent-%COMP%_bounceOutRight{20%{opacity:1;transform:translate3d(-20px,0,0)}to{opacity:0;transform:translate3d(2000px,0,0)}}@keyframes _ngcontent-%COMP%_bounceInLeft{0%,60%,75%,90%,to{animation-timing-function:cubic-bezier(.215,.61,.355,1)}0%{opacity:0;transform:translate3d(-3000px,0,0)}60%{opacity:1;transform:translate3d(25px,0,0)}75%{transform:translate3d(-10px,0,0)}90%{transform:translate3d(5px,0,0)}to{transform:none}}@keyframes _ngcontent-%COMP%_bounceOutLeft{20%{opacity:1;transform:translate3d(20px,0,0)}to{opacity:0;transform:translate3d(-2000px,0,0)}}@keyframes _ngcontent-%COMP%_bounceInUp{0%,60%,75%,90%,to{animation-timing-function:cubic-bezier(.215,.61,.355,1)}0%{opacity:0;transform:translate3d(0,3000px,0)}60%{opacity:1;transform:translate3d(0,-20px,0)}75%{transform:translate3d(0,10px,0)}90%{transform:translate3d(0,-5px,0)}to{transform:translateZ(0)}}@keyframes _ngcontent-%COMP%_bounceOutUp{20%{transform:translate3d(0,-10px,0)}40%,45%{opacity:1;transform:translate3d(0,20px,0)}to{opacity:0;transform:translate3d(0,-2000px,0)}}@keyframes _ngcontent-%COMP%_bounceInDown{0%,60%,75%,90%,to{animation-timing-function:cubic-bezier(.215,.61,.355,1)}0%{opacity:0;transform:translate3d(0,-3000px,0)}60%{opacity:1;transform:translate3d(0,25px,0)}75%{transform:translate3d(0,-10px,0)}90%{transform:translate3d(0,5px,0)}to{transform:none}}@keyframes _ngcontent-%COMP%_bounceOutDown{20%{transform:translate3d(0,10px,0)}40%,45%{opacity:1;transform:translate3d(0,-20px,0)}to{opacity:0;transform:translate3d(0,2000px,0)}}.bounce-enter--bottom-left[_ngcontent-%COMP%], .bounce-enter--top-left[_ngcontent-%COMP%]{animation-name:_ngcontent-%COMP%_bounceInLeft}.bounce-enter--bottom-right[_ngcontent-%COMP%], .bounce-enter--top-right[_ngcontent-%COMP%]{animation-name:_ngcontent-%COMP%_bounceInRight}.bounce-enter--top-center[_ngcontent-%COMP%]{animation-name:_ngcontent-%COMP%_bounceInDown}.bounce-enter--bottom-center[_ngcontent-%COMP%]{animation-name:_ngcontent-%COMP%_bounceInUp}.bounce-exit--bottom-left[_ngcontent-%COMP%], .bounce-exit--top-left[_ngcontent-%COMP%]{animation-name:_ngcontent-%COMP%_bounceOutLeft}.bounce-exit--bottom-right[_ngcontent-%COMP%], .bounce-exit--top-right[_ngcontent-%COMP%]{animation-name:_ngcontent-%COMP%_bounceOutRight}.bounce-exit--top-center[_ngcontent-%COMP%]{animation-name:_ngcontent-%COMP%_bounceOutUp}.bounce-exit--bottom-center[_ngcontent-%COMP%]{animation-name:_ngcontent-%COMP%_bounceOutDown}@keyframes _ngcontent-%COMP%_zoomIn{0%{opacity:0;transform:scale3d(.3,.3,.3)}50%{opacity:1}}@keyframes _ngcontent-%COMP%_zoomOut{0%{opacity:1}50%{opacity:0;transform:scale3d(.3,.3,.3)}to{opacity:0}}.zoom-enter[_ngcontent-%COMP%]{animation-name:_ngcontent-%COMP%_zoomIn}.zoom-exit[_ngcontent-%COMP%]{animation-name:_ngcontent-%COMP%_zoomOut}@keyframes _ngcontent-%COMP%_flipIn{0%{transform:perspective(400px) rotateX(90deg);animation-timing-function:ease-in;opacity:0}40%{transform:perspective(400px) rotateX(-20deg);animation-timing-function:ease-in}60%{transform:perspective(400px) rotateX(10deg);opacity:1}80%{transform:perspective(400px) rotateX(-5deg)}to{transform:perspective(400px)}}@keyframes _ngcontent-%COMP%_flipOut{0%{transform:perspective(400px)}30%{transform:perspective(400px) rotateX(-20deg);opacity:1}to{transform:perspective(400px) rotateX(90deg);opacity:0}}.flip-enter[_ngcontent-%COMP%]{animation-name:_ngcontent-%COMP%_flipIn}.flip-exit[_ngcontent-%COMP%]{animation-name:_ngcontent-%COMP%_flipOut}@keyframes _ngcontent-%COMP%_slideInRight{0%{transform:translate3d(110%,0,0);visibility:visible}to{transform:translateZ(0)}}@keyframes _ngcontent-%COMP%_slideInLeft{0%{transform:translate3d(-110%,0,0);visibility:visible}to{transform:translateZ(0)}}@keyframes _ngcontent-%COMP%_slideInUp{0%{transform:translate3d(0,110%,0);visibility:visible}to{transform:translateZ(0)}}@keyframes _ngcontent-%COMP%_slideInDown{0%{transform:translate3d(0,-110%,0);visibility:visible}to{transform:translateZ(0)}}@keyframes _ngcontent-%COMP%_slideOutRight{0%{transform:translateZ(0)}to{visibility:hidden;transform:translate3d(110%,0,0)}}@keyframes _ngcontent-%COMP%_slideOutLeft{0%{transform:translateZ(0)}to{visibility:hidden;transform:translate3d(-110%,0,0)}}@keyframes _ngcontent-%COMP%_slideOutDown{0%{transform:translateZ(0)}to{visibility:hidden;transform:translate3d(0,500px,0)}}@keyframes _ngcontent-%COMP%_slideOutUp{0%{transform:translateZ(0)}to{visibility:hidden;transform:translate3d(0,-500px,0)}}.slide-enter--bottom-left[_ngcontent-%COMP%], .slide-enter--top-left[_ngcontent-%COMP%]{animation-name:_ngcontent-%COMP%_slideInLeft}.slide-enter--bottom-right[_ngcontent-%COMP%], .slide-enter--top-right[_ngcontent-%COMP%]{animation-name:_ngcontent-%COMP%_slideInRight}.slide-enter--top-center[_ngcontent-%COMP%]{animation-name:_ngcontent-%COMP%_slideInDown}.slide-enter--bottom-center[_ngcontent-%COMP%]{animation-name:_ngcontent-%COMP%_slideInUp}.slide-exit--bottom-left[_ngcontent-%COMP%], .slide-exit--top-left[_ngcontent-%COMP%]{animation-name:_ngcontent-%COMP%_slideOutLeft}.slide-exit--bottom-right[_ngcontent-%COMP%], .slide-exit--top-right[_ngcontent-%COMP%]{animation-name:_ngcontent-%COMP%_slideOutRight}.slide-exit--top-center[_ngcontent-%COMP%]{animation-name:_ngcontent-%COMP%_slideOutUp}.slide-exit--bottom-center[_ngcontent-%COMP%]{animation-name:_ngcontent-%COMP%_slideOutDown}"],
  changeDetection: 0
});
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(ToastifyToastContainerComponent, [{
    type: Component,
    args: [{
      // tslint:disable-next-line:component-selector
      selector: "lib-toastify-toast-container",
      templateUrl: "./toastify-toast-container.component.html",
      styleUrls: ["./toastify-toast-container.component.scss"],
      changeDetection: ChangeDetectionStrategy.OnPush
    }]
  }], function() {
    return [{
      type: ToastService
    }, {
      type: ChangeDetectorRef
    }];
  }, {
    position: [{
      type: Input
    }],
    transition: [{
      type: Input
    }],
    autoClose: [{
      type: Input
    }],
    autoCloseError: [{
      type: Input
    }],
    autoCloseSuccess: [{
      type: Input
    }],
    autoCloseInfo: [{
      type: Input
    }],
    autoCloseWarn: [{
      type: Input
    }],
    hideProgressBar: [{
      type: Input
    }],
    pauseOnHover: [{
      type: Input
    }],
    pauseOnVisibilityChange: [{
      type: Input
    }],
    closeOnClick: [{
      type: Input
    }],
    newestOnTop: [{
      type: Input
    }],
    preventDuplicates: [{
      type: Input
    }],
    iconLibrary: [{
      type: Input
    }]
  });
})();
var TransitionState;
(function(TransitionState2) {
  TransitionState2[TransitionState2["entering"] = 0] = "entering";
  TransitionState2[TransitionState2["noTransition"] = 1] = "noTransition";
  TransitionState2[TransitionState2["exiting"] = 2] = "exiting";
})(TransitionState || (TransitionState = {}));
var AngularToastifyModule = class {
};
AngularToastifyModule.ɵfac = function AngularToastifyModule_Factory(t) {
  return new (t || AngularToastifyModule)();
};
AngularToastifyModule.ɵmod = ɵɵdefineNgModule({
  type: AngularToastifyModule,
  declarations: [ToastifyToastComponent, ToastifyToastContainerComponent],
  imports: [CommonModule],
  exports: [ToastifyToastContainerComponent]
});
AngularToastifyModule.ɵinj = ɵɵdefineInjector({
  imports: [[CommonModule]]
});
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(AngularToastifyModule, [{
    type: NgModule,
    args: [{
      declarations: [ToastifyToastComponent, ToastifyToastContainerComponent],
      imports: [CommonModule],
      exports: [ToastifyToastContainerComponent]
    }]
  }], null, null);
})();
export {
  AngularToastifyModule,
  ToastService,
  ToastifyToastContainerComponent
};
//# sourceMappingURL=angular-toastify.js.map
