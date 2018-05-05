class MyVolumioChangeSubscriptionController {
  constructor($scope, $state, $stateParams, $q, authService, user, paymentsService, StripeCheckout, modalService, productsService, $filter, $document) {
    'ngInject';
    this.$scope = $scope;
    this.$state = $state;
    this.$stateParams = $stateParams;
    this.$q = $q;
    this.modalService = modalService;
    this.paymentsService = paymentsService;
    this.authService = authService;
    this.stripeCheckout = StripeCheckout;
    this.productsService = productsService;
    this.filteredTranslate = $filter('translate');
    this.$document = $document;
    this.openedModal = {};

    this.user = user;
    this.product = null;

    this.init();
  }

  init() {
    this.loadProduct();
    this.authInit();
  }

  loadProduct() {
    var plan = this.$stateParams['plan'];
    this.productsService.getProductByCode(plan).then(product => {
      this.product = product;
    });
  }

  authInit() {
    this.$scope.$watch(() => this.authService.user, (user) => {
      this.user = user;
    });
  }

  changePlan() {
    if (this.user.subscriptionId === undefined || this.user.subscriptionId === null) {
      this.modalService.openDefaultErrorModal("MYVOLUMIO.ERROR_CHANGE_PLAN_NO_PREVIOUS_PLAN_FOUND");
      return;
    }
    if (this.product === undefined || this.product === null || this.product.planCode === undefined) {
      this.modalService.openDefaultErrorModal("MYVOLUMIO.ERROR_CHANGE_PLAN_NO_PLAN_SELECTED");
      return;
    }
    this.authService.getUserToken().then(token => {
      console.log(this.product)
      this.updateCallback(this.paymentsService.updateSubscription(this.product, this.user.uid, token));
    });
  }

  updateCallback(cancelling) {
    this.openUpdatingModal();
    cancelling.then((status) => {
      this.closeUpdatingModal();
      if (status === true) {
        this.goToUpdatingSuccess();
        return;
      }
      this.goToUpdatingFail();
    }).catch((error) => {
      console.log(error);
      this.closeUpdatingModal();
      this.modalService.openDefaultErrorModal(error, () => {
        this.goToUpdatingFail();
      });
    });
  }

  openUpdatingModal() {
    let
      templateUrl = 'app/components/myvolumio/modals/myvolumio-paying-modal/myvolumio-paying-modal.html',
      controller = 'MyVolumioPayingModalController',
      params = {
        title: this.filteredTranslate('MYVOLUMIO.PAYMENT_IN_PROGRESS')
      };
    this.openedModal = this.modalService.openModal(
      controller,
      templateUrl,
      params,
      'md');
  }

  closeUpdatingModal() {
    this.openedModal.close();
  }

  goToUpdatingSuccess() {
    this.$state.go('myvolumio.payment-success');
  }

  goToUpdatingFail() {
    this.$state.go('myvolumio.payment-fail');
  }

  logIn() {
    this.$state.go('myvolumio.login');
  }

  goToPlans() {
    this.$state.go('myvolumio.plans');
  }

  getCurrentPlanName() {
    return this.user.plan;
  }

}

export default MyVolumioChangeSubscriptionController;