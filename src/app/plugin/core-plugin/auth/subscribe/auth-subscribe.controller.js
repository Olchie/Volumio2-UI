class AuthSubscribeController {
  constructor($scope, $state, $stateParams, $q, authService, user, paymentsService, StripeCheckout, modalService, productsService, $filter) {
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

    this.openedModal = {};

    this.product = null;
    this.user = user;

    this.init();
  }

  init() {
    this.authInit();
    this.loadProduct();
  }

  authInit() {
    this.$scope.$watch(() => this.authService.user,(user) => {
      this.user = user;
    });
  }

  subscriptionCallback(subscribing) {
    this.openPayingModal();
    subscribing.then((status) => {
      this.closePayingModal();
      if (status === true) {
        this.goToPaymentSuccess();
        return;
      }
      this.goToPaymentFail();
    }, (error) => {
      if(error )
      //error = JSON.stringify(error);
      console.log(error);
      this.modalService.openDefaultErrorModal(error, () => {
        this.closePayingModal();
        this.goToPaymentFail();
      });
    });
  }

  openPayingModal() {
    let
            templateUrl = 'app/plugin/core-plugin/auth/modals/auth-paying-modal/auth-paying-modal.html',
            controller = 'AuthPayingModalController',
            params = {
              title: this.filteredTranslate('AUTH.PAYNG')
            };
    this.openedModal = this.modalService.openModal(
            controller,
            templateUrl,
            params,
            'md');
  }

  closePayingModal() {
    this.openedModal.close();
  }

  goToPaymentSuccess() {
    this.$state.go('volumio.auth.payment-success');
  }

  goToPaymentFail() {
    this.$state.go('volumio.auth.payment-fail');
  }

  loadProduct() {
    var code = this.$stateParams['plan'];
    this.product = this.productsService.getProductByCode(code);
  }

  goToPlans() {
    this.$state.go('volumio.auth.plans');
  }

}

export default AuthSubscribeController;
