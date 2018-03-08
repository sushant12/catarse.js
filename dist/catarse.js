var c = (function (m,I18n$1,_$1,moment,$$1,postgrest$1,CatarseAnalytics$1,replaceDiacritics,Chart) {
'use strict';

m = 'default' in m ? m['default'] : m;
I18n$1 = 'default' in I18n$1 ? I18n$1['default'] : I18n$1;
_$1 = 'default' in _$1 ? _$1['default'] : _$1;
moment = 'default' in moment ? moment['default'] : moment;
$$1 = 'default' in $$1 ? $$1['default'] : $$1;
postgrest$1 = 'default' in postgrest$1 ? postgrest$1['default'] : postgrest$1;
CatarseAnalytics$1 = 'default' in CatarseAnalytics$1 ? CatarseAnalytics$1['default'] : CatarseAnalytics$1;
replaceDiacritics = 'default' in replaceDiacritics ? replaceDiacritics['default'] : replaceDiacritics;
Chart = 'default' in Chart ? Chart['default'] : Chart;

var models = {
    country: postgrest$1.model('countries'),
    state: postgrest$1.model('states'),
    contributionDetail: postgrest$1.model('contribution_details'),
    contributionActivity: postgrest$1.model('contribution_activities'),
    projectDetail: postgrest$1.model('project_details'),
    userDetail: postgrest$1.model('user_details'),
    balance: postgrest$1.model('balances'),
    balanceTransaction: postgrest$1.model('balance_transactions'),
    balanceTransfer: postgrest$1.model('balance_transfers'),
    user: postgrest$1.model('users'),
    userCreditCard: postgrest$1.model('user_credit_cards'),
    bankAccount: postgrest$1.model('bank_accounts'),
    bank: postgrest$1.model('banks'),
    rewardDetail: postgrest$1.model('reward_details'),
    projectReminder: postgrest$1.model('project_reminders'),
    projectReport: postgrest$1.model('project_reports'),
    contributions: postgrest$1.model('contributions'),
    directMessage: postgrest$1.model('direct_messages'),
    teamTotal: postgrest$1.model('team_totals'),
    recommendedProjects: postgrest$1.model('recommended_projects'),
    projectAccount: postgrest$1.model('project_accounts'),
    projectAccountError: postgrest$1.model('project_account_errors'),
    projectContribution: postgrest$1.model('project_contributions'),
    projectContributiorsStat: postgrest$1.model('project_stat_contributors'),
    projectPostDetail: postgrest$1.model('project_posts_details'),
    projectContributionsPerDay: postgrest$1.model('project_contributions_per_day'),
    projectContributionsPerLocation: postgrest$1.model('project_contributions_per_location'),
    projectContributionsPerRef: postgrest$1.model('project_contributions_per_ref'),
    projectVisitorsPerDay: postgrest$1.model('project_visitors_per_day'),
    projectTransfer: postgrest$1.model('project_transfers'),
    project: postgrest$1.model('projects'),
    projectSearch: postgrest$1.model('rpc/project_search'),
    publicTags: postgrest$1.model('public_tags'),
    category: postgrest$1.model('categories'),
    categoryTotals: postgrest$1.model('category_totals'),
    categoryFollower: postgrest$1.model('category_followers'),
    teamMember: postgrest$1.model('team_members'),
    notification: postgrest$1.model('notifications'),
    statistic: postgrest$1.model('statistics'),
    successfulProject: postgrest$1.model('successful_projects'),
    finishedProject: postgrest$1.model('finished_projects'),
    userFriend: postgrest$1.model('user_friends'),
    userFollow: postgrest$1.model('user_follows'),
    followAllCreators: postgrest$1.model('rpc/follow_all_creators'),
    followAllFriends: postgrest$1.model('rpc/follow_all_friends'),
    contributor: postgrest$1.model('contributors'),
    userFollower: postgrest$1.model('user_followers'),
    creatorSuggestion: postgrest$1.model('creator_suggestions'),
    userContribution: postgrest$1.model('user_contributions'),
    shippingFee: postgrest$1.model('shipping_fees'),
    deleteProject: postgrest$1.model('rpc/delete_project'),
    cancelProject: postgrest$1.model('rpc/cancel_project'),
    city: postgrest$1.model('cities')
};

models.teamMember.pageSize(40);
models.rewardDetail.pageSize(false);
models.shippingFee.pageSize(false);
models.project.pageSize(30);
models.category.pageSize(50);
models.contributionActivity.pageSize(40);
models.successfulProject.pageSize(9);
models.finishedProject.pageSize(9);
models.country.pageSize(false);
models.state.pageSize(false);
models.publicTags.pageSize(false);
models.projectContribution.pageSize(9);
models.contributor.pageSize(9);
models.recommendedProjects.pageSize(3);
models.bank.pageSize(400);
models.city.pageSize(200);
models.balanceTransfer.pageSize(9);

var currentContribution = m.prop({});

var getUserProjectContributions = function getUserProjectContributions(userId, projectId, states) {
    var vm = postgrest$1.filtersVM({
        user_id: 'eq',
        project_id: 'eq',
        state: 'in'
    });

    vm.user_id(userId);
    vm.project_id(projectId);
    vm.state(states);

    var lProjectContributions = postgrest$1.loaderWithToken(models.userContribution.getPageOptions(vm.parameters()));

    return lProjectContributions.load();
};

var getCurrentContribution = function getCurrentContribution() {
    var root = document.getElementById('application'),
        data = root && root.getAttribute('data-contribution');

    if (data) {
        currentContribution(JSON.parse(data));

        m.redraw(true);

        return currentContribution;
    }
    return false;
};

var wasConfirmed = function wasConfirmed(contribution) {
    return _$1.contains(['paid', 'pending_refund', 'refunded'], contribution.state);
};

var canShowReceipt = function canShowReceipt(contribution) {
    return wasConfirmed(contribution);
};

var canShowSlip = function canShowSlip(contribution) {
    return contribution.payment_method === 'BoletoBancario' && contribution.waiting_payment;
};

var canGenerateSlip = function canGenerateSlip(contribution) {
    return contribution.payment_method === 'BoletoBancario' && contribution.state === 'pending' && contribution.project_state === 'online' && !contribution.reward_sold_out && !contribution.waiting_payment;
};

var canBeDelivered = function canBeDelivered(contribution) {
    return contribution.state === 'paid' && contribution.reward_id && contribution.project_state !== 'failed';
};

var contributionVM = {
    getCurrentContribution: getCurrentContribution,
    canShowReceipt: canShowReceipt,
    canGenerateSlip: canGenerateSlip,
    canShowSlip: canShowSlip,
    getUserProjectContributions: getUserProjectContributions,
    canBeDelivered: canBeDelivered
};

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};



















var defineProperty = function (obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
};





















var slicedToArray = function () {
  function sliceIterator(arr, i) {
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"]) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  return function (arr, i) {
    if (Array.isArray(arr)) {
      return arr;
    } else if (Symbol.iterator in Object(arr)) {
      return sliceIterator(arr, i);
    } else {
      throw new TypeError("Invalid attempt to destructure non-iterable instance");
    }
  };
}();













var toConsumableArray = function (arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  } else {
    return Array.from(arr);
  }
};

//      
var _dataCache = {};
var hashMatch = function hashMatch(str) {
    return window.location.hash === str;
};
var paramByName = function paramByName(name) {
    var normalName = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]'),
        regex = new RegExp('[\\?&]' + normalName + '=([^&#]*)'),
        results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
};
var selfOrEmpty = function selfOrEmpty(obj) {
    var emptyState = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
    return obj || emptyState;
};
var setMomentifyLocale = function setMomentifyLocale() {
    moment.locale('en', {
        months: 'January_Feburary_Marçh_April_May_June_July_August_September_October_November_December'.split('_'),
        monthsShort: 'jan_feb_mar_apr_may_jun_jul_aug_sep_oct_nov_dec'.split('_')
    });
};
var existy = function existy(x) {
    return x != null;
};
var slugify = function slugify(str) {
    return replaceDiacritics(str.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''));
};
var momentify = function momentify(date, format) {
    format = format || 'DD/MM/YYYY';
    return date ? moment(date).locale('en').format(format) : 'no date';
};
var getRandomInt = function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};
var storeAction = function storeAction(action, value) {
    if (!sessionStorage.getItem(action)) {
        return sessionStorage.setItem(action, String(value));
    }
};
var storeObject = function storeObject(sessionKey, obj) {
    return sessionStorage.setItem(sessionKey, JSON.stringify(obj));
};
var getStoredObject = function getStoredObject(sessionKey) {
    if (sessionStorage.getItem(sessionKey)) {
        return JSON.parse(String(sessionStorage.getItem(sessionKey)));
    }
    return null;
};
var callStoredAction = function callStoredAction(action) {
    var item = sessionStorage.getItem(action);

    if (item) {
        sessionStorage.removeItem(action);
        return item;
    }
    return null;
};
var capitalize = function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
};
var discuss = function discuss(page, identifier) {
    var d = document,
        s = d.createElement('script');
    window.disqus_config = function () {
        this.page.url = page;
        this.page.identifier = identifier;
    };
    s.src = '//catarseflex.disqus.com/embed.js';
    s.setAttribute('data-timestamp', String(+new Date()));
    (d.head || d.body).appendChild(s);
    return m('');
};
var validateEmail = function validateEmail(email) {
    var re = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
    return re.test(email);
};
var validateCnpj = function validateCnpj(cnpjStr) {
    var tamanho = void 0,
        numeros = void 0,
        digitos = void 0,
        soma = void 0,
        pos = void 0,
        resultado = void 0;
    var cnpj = cnpjStr.replace(/[^\d]+/g, '');

    if (cnpj == '') {
        return false;
    }

    if (cnpj.length != 14) {
        return false;
    }

    if (cnpj == '00000000000000' || cnpj == '11111111111111' || cnpj == '22222222222222' || cnpj == '33333333333333' || cnpj == '44444444444444' || cnpj == '55555555555555' || cnpj == '66666666666666' || cnpj == '77777777777777' || cnpj == '88888888888888' || cnpj == '99999999999999') {
        return false;
    }

    tamanho = cnpj.length - 2;
    numeros = cnpj.substring(0, tamanho);
    digitos = cnpj.substring(tamanho);
    soma = 0;
    pos = tamanho - 7;

    for (var i = tamanho; i >= 1; i--) {
        soma += Number(numeros.charAt(tamanho - i)) * pos--;
        if (pos < 2) {
            pos = 9;
        }
    }
    resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (String(resultado) != digitos.charAt(0)) {
        return false;
    }

    tamanho += 1;
    numeros = cnpj.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;
    for (var _i = tamanho; _i >= 1; _i--) {
        soma += Number(numeros.charAt(tamanho - _i)) * pos--;
        if (pos < 2) {
            pos = 9;
        }
    }
    resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (String(resultado) != digitos.charAt(1)) {
        return false;
    }

    return true;
};
var validateCpf = function validateCpf(strCPF) {
    var sum = 0,
        remainder = void 0;

    if (strCPF == '00000000000') return false;

    for (var i = 1; i <= 9; i++) {
        sum += parseInt(strCPF.substring(i - 1, i)) * (11 - i);
    }
    remainder = sum * 10 % 11;

    if (remainder == 10 || remainder == 11) {
        remainder = 0;
    }

    if (remainder != parseInt(strCPF.substring(9, 10))) {
        return false;
    }

    sum = 0;

    for (var _i2 = 1; _i2 <= 10; _i2++) {
        sum += parseInt(strCPF.substring(_i2 - 1, _i2)) * (12 - _i2);
    }

    remainder = sum * 10 % 11;

    if (remainder == 10 || remainder == 11) {
        remainder = 0;
    }

    if (remainder != parseInt(strCPF.substring(10, 11))) {
        return false;
    }

    return true;
};
var validationErrors = m.prop([]);
var resetValidations = function resetValidations() {
    return validationErrors([]);
};
var validate = function validate() {
    var errorFields = m.prop([]);

    return {
        submit: function submit(fields, fn) {
            return function () {
                resetValidations();

                _$1.map(fields, function (field) {
                    if (field.rule === 'email') {
                        if (!validateEmail(field.prop())) {
                            validationErrors().push({ field: field.prop, message: 'Invalid E-mail.' });
                        }
                    }

                    if (field.rule === 'text') {
                        if (field.prop().trim() === '') {
                            validationErrors().push({ field: field.prop, message: 'The field can not be empty.' });
                        }
                    }
                });

                return !validationErrors().length > 0 ? fn() : false;
            };
        },
        hasError: function hasError(fieldProp) {
            return _$1.reduce(validationErrors(), function (memo, fieldError) {
                return fieldError.field() === fieldProp() || memo;
            }, false);
        }
    };
};
var momentFromString = function momentFromString(date, format) {
    var european = moment(date, format || 'DD/MM/YYYY');
    return european.isValid() ? european : moment(date);
};
var translatedTimeUnits = {
    days: 'days',
    minutes: 'minutes',
    hours: 'hours',
    seconds: 'seconds'
};
var translatedTime = function translatedTime(time) {
    var translatedTime = translatedTimeUnits,
        unit = function unit() {
        var projUnit = translatedTime[time.unit || 'seconds'];

        return Number(time.total) <= 1 ? projUnit.slice(0, -1) : projUnit;
    };

    return {
        unit: unit(),
        total: time.total
    };
};
var generateFormatNumber = function generateFormatNumber(s, c) {
    return function (number, n, x) {
        if (!_$1.isNumber(number)) {
            return null;
        }

        var re = '\\d(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\D' : '$') + ')',
            num = number.toFixed(Math.max(0, ~~n));
        return (c ? num.replace('.', c) : num).replace(new RegExp(re, 'g'), '$&' + (s || ','));
    };
};
var formatNumber = generateFormatNumber(',', '.');
var toggleProp = function toggleProp(defaultState, alternateState) {
    var p = m.prop(defaultState);
    p.toggle = function () {
        return p(p() === alternateState ? defaultState : alternateState);
    };

    return p;
};
var idVM = postgrest$1.filtersVM({
    id: 'eq'
});
var getCurrentProject = function getCurrentProject() {
    if (_dataCache.currentProject) {
        return _dataCache.currentProject;
    }

    var root = document.getElementById('application'),
        data = root && root.getAttribute('data-parameters');
    if (data) {
        return _dataCache.currentProject = JSON.parse(data);
    }
    return null;
};
var getRdToken = function getRdToken() {
    if (_dataCache.rdToken) {
        return _dataCache.rdToken;
    }

    var meta = _$1.first(document.querySelectorAll('[name=rd-token]'));
    return meta ? _dataCache.rdToken = meta.getAttribute('content') : null;
};
var getSimilityCustomer = function getSimilityCustomer() {
    if (_dataCache.similityCustomer) {
        return _dataCache.similityCustomer;
    }

    var meta = _$1.first(document.querySelectorAll('[name=simility-customer]'));
    return meta ? _dataCache.similityCustomer = meta.getAttribute('content') : null;
};
var getMailchimpUrl = function getMailchimpUrl() {
    if (_dataCache.mailchumUrl) {
        return _dataCache.mailchumUrl;
    }

    var meta = _$1.first(document.querySelectorAll('[name=mailchimp-url]'));
    return meta ? _dataCache.mailchumUrl = meta.getAttribute('content') : null;
};
var getUser = function getUser() {
    if (_dataCache.user) {
        return _dataCache.user;
    }

    var body = document.getElementsByTagName('body'),
        data = _$1.first(body).getAttribute('data-user');
    if (data) {
        return _dataCache.user = JSON.parse(data);
    }
    return null;
};
var getUserID = function getUserID() {
    var user = getUser();
    return user == null || user.user_id == null ? null : user.user_id;
};
var userSignedIn = function userSignedIn() {
    return !_$1.isNull(getUserID());
};
var getBlogPosts = function getBlogPosts() {
    if (_dataCache.blogPosts) {
        return _dataCache.blogPosts;
    }

    var posts = _$1.first(document.getElementsByTagName('body')).getAttribute('data-blog');

    if (posts) {
        return _dataCache.blogPosts = JSON.parse(posts);
    }
    return null;
};
var getApiHost = function getApiHost() {
    if (_dataCache.apiHost) {
        return _dataCache.apiHost;
    }

    var el = document.getElementById('api-host');
    return _dataCache.apiHost = el && el.getAttribute('content');
};
var locationActionMatch = function locationActionMatch(action) {
    var act = window.location.pathname.split('/').slice(-1)[0];
    return action === act;
};
var useAvatarOrDefault = function useAvatarOrDefault(avatarPath) {
    return avatarPath || '/assets/catarse_bootstrap/user.jpg';
};
var loader = function loader() {
    return m('.u-text-center.u-margintop-30 u-marginbottom-30', [m('img[alt="Loader"][src="https://s3.amazonaws.com/catarse.files/loader.gif"]')]);
};
var newFeatureBadge = function newFeatureBadge() {
    return m('span.badge.badge-success.margin-side-5', I18n$1.t('projects.new_feature_badge'));
};
var fbParse = function fbParse() {
    var tryParse = function tryParse() {
        try {
            window.FB.XFBML.parse();
        } catch (e) {
            //console.log(e);
        }
    };

    return window.setTimeout(tryParse, 500); // use timeout to wait async of facebook
};
var pluralize = function pluralize(count, s, p) {
    return count > 1 ? count + p : count + s;
};
var strip = function strip(html) {
    var tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
};
var simpleFormat = function simpleFormat() {
    var str = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

    str = str.replace(/\r\n?/, '\n');
    if (str.length > 0) {
        str = str.replace(/\n\n+/g, '</p><p>');
        str = str.replace(/\n/g, '<br />');
        str = '<p>' + str + '</p>';
    }
    return str;
};
var rewardSouldOut = function rewardSouldOut(reward) {
    return reward.maximum_contributions > 0 ? reward.paid_count + reward.waiting_payment_count >= reward.maximum_contributions : false;
};
var rewardRemaning = function rewardRemaning(reward) {
    return reward.maximum_contributions - (reward.paid_count + reward.waiting_payment_count);
};
var parseUrl = function parseUrl(href) {
    var l = document.createElement('a');
    l.href = href;
    return l;
};
var UIHelper = function UIHelper() {
    return function (el, isInitialized) {
        if (!isInitialized && window.$ && window.UIHelper) {
            window.UIHelper.setupResponsiveIframes($$1(el));
        }
    };
};
var toAnchor = function toAnchor() {
    return function (el, isInitialized) {
        if (!isInitialized) {
            var hash = window.location.hash.substr(1);
            if (hash === el.id) {
                window.location.hash = '';
                setTimeout(function () {
                    window.location.hash = el.id;
                });
            }
        }
    };
};
var navigateToDevise = function navigateToDevise() {
    window.location.href = '/login';
    return false;
};
var navigateTo = function navigateTo(path) {
    window.location.href = path;
    return false;
};
var cumulativeOffset = function cumulativeOffset(element) {
    var top = 0,
        left = 0;
    do {
        top += element.offsetTop || 0;
        left += element.offsetLeft || 0;
        element = element.offsetParent;
    } while (element);

    return {
        top: top,
        left: left
    };
};
var closeModal = function closeModal() {
    // Temp for rails unstyled close links
    var close = function close(elm, selector) {
        var all = document.getElementsByClassName(selector);
        var cur = elm.parentNode;
        while (cur && !_$1.contains(all, cur)) {
            cur = cur.parentNode;
        }
        if (cur) {
            cur.style.display = 'none';
        }
        return cur;
    };

    var elById = document.getElementById('modal-close');
    if (_$1.isElement(elById)) {
        elById.onclick = function (event) {
            event.preventDefault();
            close(elById, 'modal-backdrop');
        };
    }

    var els = document.getElementsByClassName('modal-close');
    _$1.map(els, function (el) {
        if (_$1.isElement(el)) {
            el.onclick = function (event) {
                event.preventDefault();
                close(el, 'modal-backdrop');
            };
        }
    });
};
var closeFlash = function closeFlash() {
    var el = document.getElementsByClassName('icon-close')[0];
    if (_$1.isElement(el)) {
        el.onclick = function (event) {
            event.preventDefault();
            if (el.parentElement) {
                el.parentElement.remove();
            }
        };
    }
};
var i18nScope = function i18nScope(scope, obj) {
    obj = obj || {};
    return _$1.extend({}, obj, { scope: scope });
};
var redrawHashChange = function redrawHashChange(before) {
    var callback = _$1.isFunction(before) ? function () {
        before();
        m.redraw();
    } : m.redraw;

    window.addEventListener('hashchange', callback, false);
};
var authenticityToken = function authenticityToken() {
    var meta = _$1.first(document.querySelectorAll('[name=csrf-token]'));
    return meta ? meta.getAttribute('content') : null;
};
var authenticityParam = function authenticityParam() {
    var meta = _$1.first(document.querySelectorAll('[name=csrf-param]'));
    return meta ? meta.getAttribute('content') : null;
};
var animateScrollTo = function animateScrollTo(el) {
    var scrolled = window.scrollY;

    var offset = cumulativeOffset(el).top,
        duration = 300,
        dFrame = (offset - scrolled) / duration,

    // EaseInOutCubic easing function. We'll abstract all animation funs later.
    eased = function eased(t) {
        return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
    },
        animation = setInterval(function () {
        var pos = eased(scrolled / offset) * scrolled;

        window.scrollTo(0, pos);

        if (scrolled >= offset) {
            clearInterval(animation);
        }

        scrolled += dFrame;
    }, 1);
};
var scrollTop = function scrollTop() {
    return window.scrollTo(0, 0);
};
var scrollTo = function scrollTo() {
    var setTrigger = function setTrigger(el, anchorId) {
        el.onclick = function () {
            var anchorEl = document.getElementById(anchorId);

            if (_$1.isElement(anchorEl)) {
                animateScrollTo(anchorEl);
            }

            return false;
        };
    };

    return function (el, isInitialized) {
        if (!isInitialized) {
            setTrigger(el, el.hash.slice(1));
        }
    };
};
var projectStateTextClass = function projectStateTextClass(state) {
    var statusText = {
        online: {
            cssClass: 'text-success',
            text: 'ONLINE'
        },
        successful: {
            cssClass: 'text-success',
            text: 'FINANCED'
        },
        failed: {
            cssClass: 'text-error',
            text: 'NOT FINANCED'
        },
        waiting_funds: {
            cssClass: 'text-waiting',
            text: 'WAITING FOR'
        },
        rejected: {
            cssClass: 'text-error',
            text: 'REFUSED'
        },
        draft: {
            cssClass: '',
            text: 'DRAFT'
        },
        in_analysis: {
            cssClass: '',
            text: 'IN ANALYSIS'
        },
        approved: {
            cssClass: 'text-success',
            text: 'APPROVED'
        }
    };

    return statusText[state];
};
var RDTracker = function RDTracker(eventId) {
    return function (el, isInitialized) {
        if (!isInitialized) {
            var integrationScript = document.createElement('script');
            integrationScript.type = 'text/javascript';
            integrationScript.id = 'RDIntegration';

            if (!document.getElementById(integrationScript.id)) {
                document.body.appendChild(integrationScript);
                integrationScript.onload = function () {
                    return window.RdIntegration.integrate(getRdToken(), eventId);
                };
                integrationScript.src = 'https://d335luupugsy2.cloudfront.net/js/integration/stable/rd-js-integration.min.js';
            }

            return false;
        }
    };
};
var analyticsEvent = function analyticsEvent(eventObj) {
    var fn = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : Function.prototype;

    // https://developers.google.com/analytics/devguides/collection/analyticsjs/command-queue-reference#send
    if (!eventObj) {
        return fn;
    }

    return function () {
        try {
            if (!eventObj.project) {
                eventObj.project = getCurrentProject();
            }
            if (!eventObj.user) {
                eventObj.user = getUser();
            }
            CatarseAnalytics$1.event(eventObj);
        } catch (e) {
            //console.error('[h.analyticsEvent] error:', e);
        }
        fn();
    };
};
var _analyticsOneTimeEventFired = {};
var analyticsOneTimeEvent = function analyticsOneTimeEvent(eventObj, fn) {
    if (!eventObj) {
        return fn;
    }

    var eventKey = _$1.compact([eventObj.cat, eventObj.act]).join('_');
    if (!eventKey) {
        throw new Error('Should inform cat or act');
    }
    return function () {
        if (!_analyticsOneTimeEventFired[eventKey]) {
            // console.log('oneTimeEvent',eventKey);
            _analyticsOneTimeEventFired[eventKey] = true;
            var fireEvent = analyticsEvent(eventObj, fn);
            fireEvent();
        }
    };
};
var monetaryToFloat = function monetaryToFloat(propValue) {
    return parseFloat(propValue().replace('.', '').replace(',', '.'));
};
var applyMonetaryMask = function applyMonetaryMask(number) {
    var onlyNumbers = String(number).replace(/[^0-9]|[.,]/g, ''),
        integerPart = onlyNumbers.slice(0, onlyNumbers.length - 2),
        decimalPart = onlyNumbers.slice(onlyNumbers.length - 2);

    integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    return integerPart + ',' + decimalPart;
};
var noNumbersMask = function noNumbersMask(value) {
    return value.replace(/[0-9]/g, '');
};
var numbersOnlyMask = function numbersOnlyMask(value) {
    return value.replace(/[^0-9]/g, '');
};
var addChar = function addChar(position, maskChar) {
    return function (char) {
        return function (string) {
            if (string.length === position && char !== maskChar) {
                return string + maskChar;
            }
            return string;
        };
    };
};
var readMaskDefinition = function readMaskDefinition(maskCharDefinitions) {
    return function (maskDefinition) {
        return _$1.compact(_$1.map(maskDefinition, function (letter, index) {
            return letter in maskCharDefinitions ? null : [index, letter];
        }));
    };
};
var isCharAllowed = function isCharAllowed(maskCharDefinitions) {
    return function (maskDefinition) {
        return function (position, newChar) {
            if (position >= maskDefinition.length) {
                return false;
            }

            var maskChar = maskDefinition.charAt(position);
            if (maskChar in maskCharDefinitions) {
                return maskCharDefinitions[maskChar].test(newChar);
            }
            return newChar === maskChar || isCharAllowed(maskCharDefinitions)(maskDefinition)(position + 1, newChar);
        };
    };
};
var applyMask = function applyMask(maskDefinition) {
    var maskFunctions = _$1.map(maskDefinition, function (maskChar) {
        return addChar(maskChar[0], maskChar[1]);
    });
    return function (string, newChar) {
        var addNewCharFunctions = _$1.map(maskFunctions, function (el) {
            return el(newChar);
        });
        var applyMaskFunctions = _$1.reduce(addNewCharFunctions, function (memo, f) {
            return _$1.isFunction(memo) ? _$1.compose(f, memo) : f;
        });
        return applyMaskFunctions(string);
    };
};
var mask = function mask(maskDefinition, value) {
    var maskCharDefinitions = {
        '9': /\d/, // String key needed to avoid flowType error
        A: /[a-zA-Z]/
    },
        readMask = readMaskDefinition(maskCharDefinitions),
        isStrCharAllowed = isCharAllowed(maskCharDefinitions),
        applyValueMask = applyMask(readMask(maskDefinition)),
        restrictInput = isStrCharAllowed(maskDefinition);

    return _$1.reduce(value, function (memo, chr) {
        if (restrictInput(memo.length, chr)) {
            memo = applyValueMask(memo, chr) + chr;
        }
        return memo;
    }, '');
};
var removeStoredObject = function removeStoredObject(sessionKey) {
    return sessionStorage.removeItem(sessionKey);
};
var currentProject = m.prop();
var setProject = function setProject(project) {
    currentProject(project);
};
var getProject = function getProject() {
    return currentProject;
};
var currentReward = m.prop();
var setReward = function setReward(reward) {
    currentReward(reward);
};
var getReward = function getReward() {
    return currentReward;
};
var buildLink = function buildLink(link, refStr) {
    return '/' + link + (refStr ? '?ref=' + refStr : '');
};
var analyticsWindowScroll = function analyticsWindowScroll(eventObj) {
    if (eventObj) {
        (function () {
            var fired = false;
            window.addEventListener('scroll', function (e) {
                // console.log('windowScroll');
                if (!fired && window.$ && $$1(document).scrollTop() > $$1(window).height() * (3 / 4)) {
                    fired = true;
                    var fireEvent = analyticsEvent(eventObj);
                    fireEvent();
                }
            });
        })();
    }
};
var analytics = {
    event: analyticsEvent,
    oneTimeEvent: analyticsOneTimeEvent,
    windowScroll: analyticsWindowScroll
};
var projectFullPermalink = function projectFullPermalink(project) {
    var permalink = void 0;
    if (typeof project === 'function') {
        permalink = project().permalink;
    } else {
        permalink = project.permalink;
    }

    return 'http://www.grasruts.com/' + permalink;
};
var isHome = function isHome() {
    var path = window.location.pathname;

    return path == '/en' || path == '/';
};
var isProjectPage = function isProjectPage() {
    var path = window.location.pathname,
        isOnInsights = path.indexOf('/insights') > -1,
        isOnEdit = path.indexOf('/edit') > -1,
        isOnContribution = path.indexOf('/contribution') > -1;

    return !isOnEdit && !isOnInsights && !isOnContribution;
};
var setPageTitle = function setPageTitle(title) {
    return function (el, isInitialized) {
        var titleEl = document.getElementsByTagName('title')[0],
            currentTitle = titleEl.innerText;

        if (currentTitle !== title) {
            return titleEl.innerText = title;
        }
    };
};
var checkReminder = function checkReminder() {
    var reminder = sessionStorage.getItem('reminder');

    if (reminder && isHome()) {
        window.location.href = '/projects/' + reminder;
    }
};
var rootUrl = function rootUrl() {
    if (_dataCache.rootUrl) {
        return _dataCache.rootUrl;
    }

    var meta = _$1.first(document.querySelectorAll('[name=root-url]'));

    return meta ? _dataCache.rootUrl = meta.getAttribute('content') : null;
};
var redactorConfig = function redactorConfig(params) {
    return {
        source: false,
        formatting: ['p'],
        formattingAdd: [{
            tag: 'blockquote',
            title: 'To quote',
            class: 'fontsize-base quote',
            clear: true
        }, {
            tag: 'p',
            title: 'Header 1',
            class: 'fontsize-larger fontweight-semibold',
            clear: true
        }, {
            tag: 'p',
            title: 'Header 2',
            class: 'fontsize-large',
            clear: true
        }],
        lang: 'en',
        maxHeight: 800,
        minHeight: 300,
        convertVideoLinks: true,
        convertUrlLinks: true,
        convertImageLinks: false,
        // You can specify, which ones plugins you need.
        // If you want to use plugins, you have add plugins to your
        // application.js and application.css files and uncomment the line below:
        // "plugins": ['fontsize', 'fontcolor', 'fontfamily', 'fullscreen', 'textdirection', 'clips'],
        plugins: ['video'],
        imageUpload: '/redactor_rails/pictures?' + params,
        imageGetJson: '/redactor_rails/pictures',
        path: '/assets/redactor-rails',
        css: 'style.css'
    };
};
var setRedactor = function setRedactor(prop) {
    return function (el, isInit) {
        if (!isInit) {
            (function () {
                var $editor = window.$(el);
                var csrf_token = authenticityToken();
                var csrf_param = authenticityParam();
                var params = '';
                if (csrf_param && csrf_token) {
                    params = csrf_param + '=' + encodeURIComponent(csrf_token);
                }
                $editor.redactor(redactorConfig(params));
                $editor.redactor('code.set', prop());
                // If we need to get redactor values and send it to js objects we'll have to add
                // a hook on the change.callback.redactor event. e.g.:
                // $editor.on('change.callback.redactor', () => prop($editor.redactor('code.get')) );
                // TODO: workaround to get redactor data
                window.$('.redactor-editor').on('blur', function () {
                    return prop($editor.redactor('code.get'));
                });
            })();
        }
    };
};
var redactor = function redactor(name, prop) {
    return m('textarea.input_field.redactor.w-input.text-field.bottom.jumbo.positive', {
        name: name, config: setRedactor(prop)
    });
};
var setCsrfToken = function setCsrfToken(xhr) {
    if (authenticityToken()) {
        xhr.setRequestHeader('X-CSRF-Token', authenticityToken());
    }
};
var contributionStatusBadge = function contributionStatusBadge(contribution) {
    var status = {
        delivered: m('span.fontsize-smallest.badge.badge-success', 'Sent'),
        received: m('span.fontsize-smallest.badge.badge-success', 'Received'),
        undelivered: m('span.fontsize-smallest.badge.badge-light', 'Not sent'),
        error: m('span.fontsize-smallest.badge.badge-attention', 'Error sending')
    };

    return contributionVM.canBeDelivered(contribution) ? status[contribution.delivery_status] : '';
};
var getParams = function getParams(searchKey) {
    var query = window.location.href;
    var queryParams = (/^[?#]/.test(query) ? query.slice(1) : query).split('?');

    return queryParams.length > 1 ? queryParams[1].split('&').reduce(function (params, param) {
        var _param$split = param.split('='),
            _param$split2 = slicedToArray(_param$split, 2),
            key = _param$split2[0],
            value = _param$split2[1];

        params[key] = value ? decodeURIComponent(value.replace(/\+/g, ' ')) : '';
        return params;
    }, {})[searchKey] : null;
};

setMomentifyLocale();
closeFlash();
closeModal();
checkReminder();

var h = {
    authenticityParam: authenticityParam,
    authenticityToken: authenticityToken,
    buildLink: buildLink,
    contributionStatusBadge: contributionStatusBadge,
    cumulativeOffset: cumulativeOffset,
    discuss: discuss,
    existy: existy,
    slugify: slugify,
    validateEmail: validateEmail,
    validateCpf: validateCpf,
    validateCnpj: validateCnpj,
    momentify: momentify,
    momentFromString: momentFromString,
    formatNumber: formatNumber,
    idVM: idVM,
    getUser: getUser,
    getUserID: getUserID,
    getSimilityCustomer: getSimilityCustomer,
    getApiHost: getApiHost,
    getMailchimpUrl: getMailchimpUrl,
    getCurrentProject: getCurrentProject,
    getParams: getParams,
    toggleProp: toggleProp,
    loader: loader,
    newFeatureBadge: newFeatureBadge,
    fbParse: fbParse,
    pluralize: pluralize,
    simpleFormat: simpleFormat,
    translatedTime: translatedTime,
    rewardSouldOut: rewardSouldOut,
    rewardRemaning: rewardRemaning,
    parseUrl: parseUrl,
    hashMatch: hashMatch,
    redrawHashChange: redrawHashChange,
    useAvatarOrDefault: useAvatarOrDefault,
    locationActionMatch: locationActionMatch,
    navigateToDevise: navigateToDevise,
    navigateTo: navigateTo,
    storeAction: storeAction,
    callStoredAction: callStoredAction,
    UIHelper: UIHelper,
    toAnchor: toAnchor,
    capitalize: capitalize,
    paramByName: paramByName,
    i18nScope: i18nScope,
    RDTracker: RDTracker,
    selfOrEmpty: selfOrEmpty,
    animateScrollTo: animateScrollTo,
    scrollTo: scrollTo,
    scrollTop: scrollTop,
    getRandomInt: getRandomInt,
    projectStateTextClass: projectStateTextClass,
    validationErrors: validationErrors,
    validate: validate,
    analytics: analytics,
    strip: strip,
    storeObject: storeObject,
    getStoredObject: getStoredObject,
    removeStoredObject: removeStoredObject,
    setProject: setProject,
    getProject: getProject,
    setReward: setReward,
    getReward: getReward,
    applyMonetaryMask: applyMonetaryMask,
    noNumbersMask: noNumbersMask,
    numbersOnlyMask: numbersOnlyMask,
    monetaryToFloat: monetaryToFloat,
    mask: mask,
    projectFullPermalink: projectFullPermalink,
    isProjectPage: isProjectPage,
    setPageTitle: setPageTitle,
    rootUrl: rootUrl,
    redactor: redactor,
    setCsrfToken: setCsrfToken,
    userSignedIn: userSignedIn
};

var userListVM = postgrest.paginationVM(models.user, 'id.desc', { Prefer: 'count=exact' });

var vm = postgrest.filtersVM({
    full_text_index: '@@',
    deactivated_at: 'is.null'
});
var paramToString = function paramToString(p) {
    return (p || '').toString().trim();
};

// Set default values
vm.deactivated_at(null).order({
    id: 'desc'
});

vm.deactivated_at.toFilter = function () {
    var filter = JSON.parse(vm.deactivated_at());
    return filter;
};

vm.full_text_index.toFilter = function () {
    var filter = paramToString(vm.full_text_index());
    return filter && replaceDiacritics(filter) || undefined;
};

var filterMain = {
    view: function view(ctrl, args) {
        var inputWrapperClass = args.inputWrapperClass || '.w-input.text-field.positive.medium',
            btnClass = args.btnClass || '.btn.btn-large.u-marginbottom-10';

        return m('.w-row', [m('.w-col.w-col-8', [m('input' + inputWrapperClass + '[placeholder="' + args.placeholder + '"][type="text"]', {
            onchange: m.withAttr('value', args.vm),
            value: args.vm()
        })]), m('.w-col.w-col-4', [m('input#filter-btn' + btnClass + '[type="submit"][value="To seek"]')])]);
    }
};

var adminFilter = {
    controller: function controller() {
        return {
            toggler: h.toggleProp(false, true)
        };
    },
    view: function view(ctrl, args) {
        var filterBuilder = args.filterBuilder,
            data = args.data,
            label = args.label || '',
            main = _$1.findWhere(filterBuilder, {
            component: filterMain
        });

        return m('#admin-contributions-filter.w-section.page-header', [m('.w-container', [m('.fontsize-larger.u-text-center.u-marginbottom-30', label), m('.w-form', [m('form', {
            onsubmit: args.submit
        }, [main ? m.component(main.component, main.data) : '', m('.u-marginbottom-20.w-row', m('button.w-col.w-col-12.fontsize-smallest.link-hidden-light[style="background: none; border: none; outline: none; text-align: left;"][type="button"]', {
            onclick: ctrl.toggler.toggle
        }, 'Advanced Filters  >')), ctrl.toggler() ? m('#advanced-search.w-row.admin-filters', [_$1.map(filterBuilder, function (f) {
            return f.component !== filterMain ? m.component(f.component, f.data) : '';
        })]) : ''])])])]);
    }
};

var adminItem = {
    controller: function controller(args) {
        return {
            displayDetailBox: h.toggleProp(false, true)
        };
    },
    view: function view(ctrl, args) {
        var item = args.item,
            listWrapper = args.listWrapper || {},
            selectedItem = _$1.isFunction(listWrapper.isSelected) ? listWrapper.isSelected(item.id) : false;

        return m('.w-clearfix.card.u-radius.u-marginbottom-20.results-admin-items', {
            class: selectedItem ? 'card-alert' : ''
        }, [m.component(args.listItem, {
            item: item,
            listWrapper: args.listWrapper,
            key: args.key
        }), m('button.w-inline-block.arrow-admin.fa.fa-chevron-down.fontcolor-secondary', {
            onclick: ctrl.displayDetailBox.toggle
        }), ctrl.displayDetailBox() ? m.component(args.listDetail, {
            item: item,
            key: args.key
        }) : '']);
    }
};

var adminList = {
    controller: function controller(args) {
        var list = args.vm.list;

        if (!list.collection().length && list.firstPage) {
            list.firstPage().then(null, function (serverError) {
                args.vm.error(serverError.message);
            });
        }
    },
    view: function view(ctrl, args) {
        var list = args.vm.list,
            error = args.vm.error,
            label = args.label || '',
            itemComponent = args.itemComponent || adminItem;

        return m('.w-section.section', [m('.w-container', error() ? m('.card.card-error.u-radius.fontweight-bold', error()) : [m('.w-row.u-marginbottom-20', [m('.w-col.w-col-9', [m('.fontsize-base', list.isLoading() ? 'Carregando ' + label.toLowerCase() + '...' : [m('.w-row', [m('.w-col.w-col-3', [m('.fontweight-semibold', list.total()), ' ' + label.toLowerCase() + ' encontrados']), args.vm && args.vm.hasInputAction ? m('.w-col-9.w-col', args.vm.inputActions()) : ''])])])]), m('#admin-contributions-list.w-container', [list.collection().map(function (item) {
            return m.component(itemComponent, {
                listItem: args.listItem,
                listDetail: args.listDetail,
                listWrapper: args.vm,
                item: item,
                key: item.id
            });
        }), m('.w-section.section', [m('.w-container', [m('.w-row', [m('.w-col.w-col-2.w-col-push-5', [list.isLoading() ? h.loader() : m('button#load-more.btn.btn-medium.btn-terciary', {
            onclick: list.nextPage
        }, 'Load more')])])])])])])]);
    }
};

var adminUser = {
    view: function view(ctrl, args) {
        var user = args.item;

        return m('.w-row.admin-user', [m('.w-col.w-col-3.w-col-small-3.u-marginbottom-10', [m('img.user-avatar[src="' + h.useAvatarOrDefault(user.profile_img_thumbnail) + '"]')]), m('.w-col.w-col-9.w-col-small-9', [m('.fontweight-semibold.fontsize-smaller.lineheight-tighter.u-marginbottom-10', [m('a.alt-link[target="_blank"][href="/users/' + user.id + '/edit"]', user.name || user.email)]), m('.fontsize-smallest', 'User: ' + user.id), m('.fontsize-smallest.fontcolor-secondary', 'Email: ' + user.email), args.additional_data])]);
    }
};

var adminUserItem = {
    view: function view(ctrl, args) {
        return m('.w-row', [m('.w-col.w-col-4', [m.component(adminUser, args)])]);
    }
};

var I18nScope = _.partial(h.i18nScope, 'projects');

var projectFiltersVM = function projectFiltersVM() {
    var filtersVM = postgrest$1.filtersVM,
        all = filtersVM({
        state: 'eq'
    }).state('online'),
        nearMe = filtersVM({
        near_me: 'eq',
        open_for_contributions: 'eq'
    }).open_for_contributions('true').near_me(true),
        expiring = filtersVM({
        expires_at: 'lte',
        open_for_contributions: 'eq'
    }).open_for_contributions('true').expires_at(moment().add(14, 'days').format('YYYY-MM-DD')),
        recent = filtersVM({
        online_date: 'gte',
        open_for_contributions: 'eq'
    }).open_for_contributions('true').online_date(moment().subtract(5, 'days').format('YYYY-MM-DD')),
        score = filtersVM({
        score: 'gte',
        open_for_contributions: 'eq'
    }).score('1').open_for_contributions('true'),
        online = filtersVM({
        open_for_contributions: 'eq'
    }).open_for_contributions('true'),
        contributed_by_friends = filtersVM({
        open_for_contributions: 'eq',
        contributed_by_friends: 'eq'
    }).open_for_contributions('true').contributed_by_friends(true),
        successful = filtersVM({
        state: 'eq'
    }).state('successful'),
        finished = filtersVM({}),
        filters = {
        all: {
            title: 'All categories',
            filter: all,
            nicename: 'Online',
            isContextual: false,
            keyName: 'all'
        },
        score: {
            title: 'All categories',
            filter: score,
            nicename: 'Most Popular',
            isContextual: false,
            keyName: 'score'
        },
        contributed_by_friends: {
            title: 'Friends',
            filter: contributed_by_friends,
            nicename: 'Friends',
            isContextual: false,
            keyName: 'contributed_by_friends'
        },
        online: {
            title: 'Online',
            filter: online,
            isContextual: false,
            keyName: 'online'
        },
        expiring: {
            title: 'Expiring',
            filter: expiring,
            isContextual: false,
            keyName: 'expiring'
        },
        successful: {
            title: 'All categories',
            filter: successful,
            nicename: 'Financed',
            isContextual: false,
            keyName: 'successful'
        },
        finished: {
            title: 'All categories',
            filter: finished,
            nicename: 'Finished',
            isContextual: false,
            keyName: 'finished'
        },
        recent: {
            title: 'Recent',
            filter: recent,
            isContextual: false,
            keyName: 'recent'
        },
        near_me: {
            title: 'Near me',
            filter: nearMe,
            isContextual: false,
            keyName: 'near_me'
        }
    };

    var setContextFilters = function setContextFilters(contextFilters) {
        _.map(contextFilters, function (filterKey) {
            return filters[filterKey].isContextual = true;
        });

        return filters;
    },
        getContextFilters = function getContextFilters() {
        return _.filter(filters, function (filter) {
            return filter.isContextual;
        });
    },
        removeContextFilter = function removeContextFilter(filter) {
        filters[filter.keyName].isContextual = false;

        return filters;
    };

    return {
        filters: filters,
        setContextFilters: setContextFilters,
        getContextFilters: getContextFilters,
        removeContextFilter: removeContextFilter
    };
};

var idVM$1 = h.idVM;
var currentUser = m.prop({});
var createdVM = postgrest$1.filtersVM({ project_user_id: 'eq' });

var getUserCreatedProjects = function getUserCreatedProjects(user_id) {
    var pageSize = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 3;

    createdVM.project_user_id(user_id).order({ project_id: 'desc' });

    models.project.pageSize(pageSize);

    var lUserCreated = postgrest$1.loaderWithToken(models.project.getPageOptions(createdVM.parameters()));

    return lUserCreated.load();
};

var getPublicUserContributedProjects = function getPublicUserContributedProjects(user_id) {
    var pageSize = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 3;

    var contextVM = postgrest$1.filtersVM({
        user_id: 'eq'
    });

    contextVM.user_id(user_id);

    models.contributor.pageSize(pageSize);

    var lUserContributed = postgrest$1.loaderWithToken(models.contributor.getPageOptions(contextVM.parameters()));

    return lUserContributed.load();
};

var getUserBalance = function getUserBalance(user_id) {
    var contextVM = postgrest$1.filtersVM({
        user_id: 'eq'
    });
    contextVM.user_id(user_id);

    var loader = postgrest$1.loaderWithToken(models.balance.getPageOptions(contextVM.parameters()));
    return loader.load();
};

var getUserBankAccount = function getUserBankAccount(user_id) {
    var contextVM = postgrest$1.filtersVM({
        user_id: 'eq'
    });

    contextVM.user_id(user_id);

    var lUserAccount = postgrest$1.loaderWithToken(models.bankAccount.getPageOptions(contextVM.parameters()));
    return lUserAccount.load();
};

var getUserProjectReminders = function getUserProjectReminders(user_id) {
    var contextVM = postgrest$1.filtersVM({
        user_id: 'eq',
        without_notification: 'eq'
    });

    contextVM.user_id(user_id).without_notification(true);

    models.projectReminder;

    var lUserReminders = postgrest$1.loaderWithToken(models.projectReminder.getPageOptions(contextVM.parameters()));

    return lUserReminders.load();
};

var getUserCreditCards = function getUserCreditCards(user_id) {
    var contextVM = postgrest$1.filtersVM({
        user_id: 'eq'
    });

    contextVM.user_id(user_id);

    models.userCreditCard.pageSize(false);

    var lUserCards = postgrest$1.loaderWithToken(models.userCreditCard.getPageOptions(contextVM.parameters()));

    return lUserCards.load();
};

var toggleDelivery = function toggleDelivery(projectId, contribution) {
    return m.request({
        method: 'GET',
        config: h.setCsrfToken,
        url: '/projects/' + projectId + '/contributions/' + contribution.contribution_id + '/toggle_delivery'
    });
};

var toggleAnonymous = function toggleAnonymous(projectId, contribution) {
    return m.request({
        method: 'GET',
        config: h.setCsrfToken,
        url: '/projects/' + projectId + '/contributions/' + contribution.contribution_id + '/toggle_anonymous'
    });
};

var getUserContributedProjects = function getUserContributedProjects(user_id) {
    var pageSize = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 3;

    var contextVM = postgrest$1.filtersVM({
        user_id: 'eq',
        state: 'in'
    });

    contextVM.user_id(user_id).order({
        created_at: 'desc'
    }).state(['refunded', 'pending_refund', 'paid']);

    models.userContribution.pageSize(pageSize);

    var lUserContributed = postgrest$1.loaderWithToken(models.userContribution.getPageOptions(contextVM.parameters()));

    return lUserContributed.load();
};

var fetchUser = function fetchUser(user_id) {
    var handlePromise = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
    var customProp = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : currentUser;

    idVM$1.id(user_id);

    var lUser = postgrest$1.loaderWithToken(models.userDetail.getRowOptions(idVM$1.parameters()));

    return !handlePromise ? lUser.load() : lUser.load().then(_$1.compose(customProp, _$1.first));
};

var getCurrentUser = function getCurrentUser() {
    fetchUser(h.getUserID());
    return currentUser;
};

var displayName = function displayName(user) {
    var u = user || { name: 'no name' };
    return _$1.isEmpty(u.public_name) ? u.name : u.public_name;
};

var displayImage = function displayImage(user) {
    var defaultImg = 'http://grasruts.com/assets/catarse_bootstrap/user.jpg';

    if (user) {
        return user.profile_img_thumbnail || defaultImg;
    }

    return defaultImg;
};

var displayCover = function displayCover(user) {
    if (user) {
        return user.profile_cover_image || displayImage(user); //
    }

    return displayImage(user);
};

var getUserRecommendedProjects = function getUserRecommendedProjects(contribution) {
    var sample3 = _$1.partial(_$1.sample, _$1, 3),
        loaders = m.prop([]),
        collection = m.prop([]),
        _h$getUser = h.getUser(),
        user_id = _h$getUser.user_id;


    var loader = function loader() {
        return _$1.reduce(loaders(), function (memo, curr) {
            var _memo = _$1.isFunction(memo) ? memo() : memo,
                _curr = _$1.isFunction(curr) ? curr() : curr;

            return _memo && _curr;
        }, true);
    };

    var loadPopular = function loadPopular() {
        var filters = projectFiltersVM().filters;
        var popular = postgrest$1.loaderWithToken(models.project.getPageOptions(_$1.extend({}, { order: 'score.desc' }, filters.score.filter.parameters())));

        loaders().push(popular);

        popular.load().then(_$1.compose(collection, sample3));
    };

    var pushProject = function pushProject(_ref) {
        var project_id = _ref.project_id;

        var project = postgrest$1.loaderWithToken(models.project.getPageOptions(postgrest$1.filtersVM({ project_id: 'eq' }).project_id(project_id).parameters()));

        loaders().push(project);
        project.load().then(function (data) {
            collection().push(_$1.first(data));
        });
    };

    var projects = postgrest$1.loaderWithToken(models.recommendedProjects.getPageOptions(postgrest$1.filtersVM({ user_id: 'eq' }).user_id(user_id).parameters()));

    projects.load().then(function (recommended) {
        if (recommended.length > 0) {
            _$1.map(recommended, pushProject);
        } else {
            loadPopular();
        }
    });

    return {
        loader: loader,
        collection: collection
    };
};

var userVM = {
    getUserCreatedProjects: getUserCreatedProjects,
    getUserCreditCards: getUserCreditCards,
    toggleDelivery: toggleDelivery,
    toggleAnonymous: toggleAnonymous,
    getUserProjectReminders: getUserProjectReminders,
    getUserRecommendedProjects: getUserRecommendedProjects,
    getUserContributedProjects: getUserContributedProjects,
    getUserBalance: getUserBalance,
    getUserBankAccount: getUserBankAccount,
    getPublicUserContributedProjects: getPublicUserContributedProjects,
    displayImage: displayImage,
    displayCover: displayCover,
    displayName: displayName,
    fetchUser: fetchUser,
    getCurrentUser: getCurrentUser
};

/**
 * window.c.AdminResetPassword component
 * Makes ajax request to update User password.
 *
 * Example:
 * m.component(c.AdminResetPassword, {
 *     data: {},
 *     item: rowFromDatabase
 * })
 */
var adminResetPassword = {
    controller: function controller(args) {
        var builder = args.data,
            complete = m.prop(false),
            error = m.prop(false),
            fail = m.prop(false),
            key = builder.property,
            data = {},
            item = args.item;

        builder.requestOptions.config = function (xhr) {
            if (h.authenticityToken()) {
                xhr.setRequestHeader('X-CSRF-Token', h.authenticityToken());
            }
        };

        var l = m.prop(false),
            load = function load() {
            return m.request(_$1.extend({}, { data: data }, builder.requestOptions));
        },
            newPassword = m.prop(''),
            error_message = m.prop('');

        var requestError = function requestError(err) {
            l(false);
            error_message(err.errors[0]);
            complete(true);
            error(true);
        };
        var updateItem = function updateItem(res) {
            l(false);
            _$1.extend(item, res[0]);
            complete(true);
            error(false);
        };

        var submit = function submit() {
            l(true);
            data[key] = newPassword();
            load().then(updateItem, requestError);
            return false;
        };

        var unload = function unload(el, isinit, context) {
            context.onunload = function () {
                complete(false);
                error(false);
            };
        };

        return {
            complete: complete,
            error: error,
            error_message: error_message,
            l: l,
            newPassword: newPassword,
            submit: submit,
            toggler: h.toggleProp(false, true),
            unload: unload
        };
    },
    view: function view(ctrl, args) {
        var data = args.data,
            btnValue = ctrl.l() ? 'please wait...' : data.callToAction;

        return m('.w-col.w-col-2', [m('button.btn.btn-small.btn-terciary', {
            onclick: ctrl.toggler.toggle
        }, data.outerLabel), ctrl.toggler() ? m('.dropdown-list.card.u-radius.dropdown-list-medium.zindex-10', {
            config: ctrl.unload
        }, [m('form.w-form', {
            onsubmit: ctrl.submit
        }, !ctrl.complete() ? [m('label', data.innerLabel), m('input.w-input.text-field[type="text"][name="' + data.property + '"][placeholder="' + data.placeholder + '"]', {
            onchange: m.withAttr('value', ctrl.newPassword),
            value: ctrl.newPassword()
        }), m('input.w-button.btn.btn-small[type="submit"][value="' + btnValue + '"]')] : !ctrl.error() ? [m('.w-form-done[style="display:block;"]', [m('p', 'Password changed successfully.')])] : [m('.w-form-error[style="display:block;"]', [m('p', ctrl.error_message())])])]) : '']);
    }
};

var adminInputAction = {
    controller: function controller(args) {
        var builder = args.data,
            complete = m.prop(false),
            error = m.prop(false),
            fail = m.prop(false),
            data = {},
            item = args.item,
            key = builder.property,
            forceValue = builder.forceValue || null,
            newValue = m.prop(forceValue);

        h.idVM.id(item[builder.updateKey]);

        var l = postgrest.loaderWithToken(builder.model.patchOptions(h.idVM.parameters(), data));

        var updateItem = function updateItem(res) {
            _.extend(item, res[0]);
            complete(true);
            error(false);
        };

        var submit = function submit() {
            data[key] = newValue();
            l.load().then(updateItem, function () {
                complete(true);
                error(true);
            });
            return false;
        };

        var unload = function unload(el, isinit, context) {
            context.onunload = function () {
                complete(false);
                error(false);
                newValue(forceValue);
            };
        };

        return {
            complete: complete,
            error: error,
            l: l,
            newValue: newValue,
            submit: submit,
            toggler: h.toggleProp(false, true),
            unload: unload
        };
    },
    view: function view(ctrl, args) {
        var data = args.data,
            btnValue = ctrl.l() ? 'please wait...' : data.callToAction;

        return m('.w-col.w-col-2', [m('button.btn.btn-small.btn-terciary', {
            onclick: ctrl.toggler.toggle
        }, data.outerLabel), ctrl.toggler() ? m('.dropdown-list.card.u-radius.dropdown-list-medium.zindex-10', {
            config: ctrl.unload
        }, [m('form.w-form', {
            onsubmit: ctrl.submit
        }, !ctrl.complete() ? [m('label', data.innerLabel), data.forceValue === undefined ? m('input.w-input.text-field[type="text"][placeholder="' + data.placeholder + '"]', {
            onchange: m.withAttr('value', ctrl.newValue),
            value: ctrl.newValue()
        }) : '', m('input.w-button.btn.btn-small[type="submit"][value="' + btnValue + '"]')] : !ctrl.error() ? [m('.w-form-done[style="display:block;"]', [m('p', data.successMessage)])] : [m('.w-form-error[style="display:block;"]', [m('p', 'There was a problem with the request. ' + data.errorMessage)])])]) : '']);
    }
};

/**
 * window.c.AdminNotificationHistory component
 * Return notifications list from an User object.
 *
 * Example:
 * m.component(c.AdminNotificationHistory, {
 *     user: user
 * })
 */
var adminNotificationHistory = {
    controller: function controller(args) {
        var notifications = m.prop([]),
            getNotifications = function getNotifications(user) {
            var notification = models.notification;
            notification.getPageWithToken(postgrest.filtersVM({
                user_id: 'eq',
                sent_at: 'is.null'
            }).user_id(user.id).sent_at(!null).order({
                sent_at: 'desc'
            }).parameters()).then(notifications);
        };

        getNotifications(args.user);

        return {
            notifications: notifications
        };
    },
    view: function view(ctrl) {
        return m('.w-col.w-col-4', [m('.fontweight-semibold.fontsize-smaller.lineheight-tighter.u-marginbottom-20', 'Notification history'), ctrl.notifications().map(function (cEvent) {
            return m('.w-row.fontsize-smallest.lineheight-looser.date-event', [m('.w-col.w-col-24', [m('.fontcolor-secondary', h.momentify(cEvent.sent_at, 'DD/MM/YYYY, HH:mm'), ' - ', m('a[target="blank"][href="/notifications/' + cEvent.relation + '/' + cEvent.id + '"]', cEvent.template_name), cEvent.origin ? ' - ' + cEvent.origin : '')])]);
        })]);
    }
};

var I18nScope$1 = _$1.partial(h.i18nScope, 'users.balance');

var adminUserBalanceTransactionsList = {
    controller: function controller(args) {
        var userBalance = m.prop({}),
            transactionsListVM = postgrest$1.paginationVM(models.balanceTransaction, 'created_at.desc', { Prefer: 'count=exact' });

        models.balanceTransaction.pageSize(2);
        userVM.getUserBalance(args.user_id).then(_$1.compose(userBalance, _$1.first));
        transactionsListVM.firstPage({ user_id: 'eq.' + args.user_id });

        return {
            userBalance: userBalance,
            transactionsListVM: transactionsListVM
        };
    },
    view: function view(ctrl, args) {
        var collection = ctrl.transactionsListVM.collection(),
            userBalance = ctrl.userBalance() || { amount: 0 };

        return m(args.wrapperClass || '.w-col.w-col-8', [m('.fontsize-smaller.fontweight-semibold.lineheight-tighter.u-marginbottom-20', I18n.t('totals_transactions_title', I18nScope$1({
            value: h.formatNumber(userBalance.amount, 2, 3)
        }))), _$1.map(collection, function (item, intex) {
            return m('.divider.fontsize-smallest.lineheight-looser', [m('.w-row.fontweight-semibold', [m('.w-col.w-col-2', [m('.fontcolor-secondary', h.momentify(item.created_at))]), m('.w-col.w-col-6', [I18n.t('day_balance', I18nScope$1())]), m('.w-col.w-col-2', m.trust('&nbsp;')), m('.w-col.w-col-2', [m('span', I18n.t('shared.currency', {
                amount: h.formatNumber(item.total_amount, 2, 3) }))])]), m('.w-row', [_$1.map(item.source, function (source, index) {
                var negativeV = source.amount < 0;
                return m('.divider.fontsize-smallest.lineheight-looser.w-row', [m('.w-col.w-col-2', []), m('.w-col.w-col-6', [m('div', I18n.t('event_names.' + source.event_name, I18nScope$1({
                    service_fee: source.origin_objects.service_fee ? source.origin_objects.service_fee * 100.0 : '',
                    project_name: source.origin_objects.project_name,
                    contributitor_name: source.origin_objects.contributor_name
                })))]), m('.w-col.w-col-2', [m(negativeV ? '.text-error' : '.text-success', [negativeV ? '- ' : '+ ', I18n.t('shared.currency', {
                    amount: h.formatNumber(Math.abs(source.amount), 2, 3)
                })])])]);
            })])]);
        }), m('.w-row', [m('.w-col.w-col-3.w-col-push-4', [ctrl.transactionsListVM.isLoading() ? h.loader() : m('button#load-more.btn.btn-terciary', {
            onclick: ctrl.transactionsListVM.nextPage
        }, I18n.t('shared.load_more'))])])]);
    }
};

/**
 * window.c.AdminUserDetail component
 * Return action inputs to be used inside AdminList component.
 *
 * Example:
 * m.component(c.AdminList, {
 *     data: {},
 *     listDetail: c.AdminUserDetail
 * })
 */
var adminUserDetail = {
    controller: function controller(args) {
        return {
            actions: {
                reset: {
                    property: 'password',
                    callToAction: 'Reset',
                    innerLabel: 'New User Password:',
                    outerLabel: 'Redefine password',
                    placeholder: 'ex: 123mud@r',
                    model: models.user
                },
                reactivate: {
                    property: 'deactivated_at',
                    updateKey: 'id',
                    callToAction: 'Reactivate',
                    innerLabel: 'Reactivate...',
                    successMessage: 'Are you sure you want to re-enable this user?...',
                    errorMessage: 'The user could not be reactivated!',
                    outerLabel: 'Reactivate user',
                    forceValue: null,
                    model: models.user
                }
            }
        };
    },
    view: function view(ctrl, args) {
        var actions = ctrl.actions,
            item = args.item,
            details = args.details,
            addOptions = function addOptions(builder, id) {
            return _$1.extend({}, builder, {
                requestOptions: {
                    url: '/users/' + id + '/new_password',
                    method: 'POST'
                }
            });
        };

        return m('#admin-contribution-detail-box', [m('.divider.u-margintop-20.u-marginbottom-20'), m('.w-row.u-marginbottom-30', [m.component(adminResetPassword, {
            data: addOptions(actions.reset, item.id),
            item: item
        }), item.deactivated_at ? m.component(adminInputAction, { data: actions.reactivate, item: item }) : '']), m('.w-row.card.card-terciary.u-radius', [m(adminNotificationHistory, {
            user: item,
            wrapperClass: '.w-col.w-col-4'
        }), m(adminUserBalanceTransactionsList, { user_id: item.id })])]);
    }
};

var dropdown = {
    view: function view(ctrl, args) {
        var opts = _$1.isFunction(args.options) ? args.options() : args.options;

        return m('select' + args.classes + '[id="' + args.id + '"]', {
            onchange: function onchange(e) {
                args.valueProp(e.target.value);args.onchange();
            },
            value: args.valueProp()
        }, _$1.map(opts, function (data) {
            return m('option[value="' + data.value + '"]', data.option);
        }));
    }
};

var filterDropdown = {
    view: function view(ctrl, args) {
        var wrapper_c = args.wrapper_class || '.w-col.w-col-3.w-col-small-6';
        return m(wrapper_c, [m('label.fontsize-smaller[for="' + args.index + '"]', args.custom_label ? m.component(args.custom_label[0], args.custom_label[1]) : args.label), m.component(dropdown, {
            id: args.index,
            onchange: _.isFunction(args.onchange) ? args.onchange : Function.prototype,
            classes: '.w-select.text-field.positive',
            valueProp: args.vm,
            options: args.options
        })]);
    }
};

var adminUsers = {
    controller: function controller() {
        var listVM = userListVM,
            filterVM = vm,
            error = m.prop(''),
            itemBuilder = [{
            component: adminUser,
            wrapperClass: '.w-col.w-col-4'
        }],
            filterBuilder = [{ // name
            component: filterMain,
            data: {
                vm: filterVM.full_text_index,
                placeholder: 'Search by name, email, user ids...'
            }
        }, { // status
            component: filterDropdown,
            data: {
                label: 'With the state',
                index: 'status',
                name: 'deactivated_at',
                vm: filterVM.deactivated_at,
                options: [{
                    value: '',
                    option: 'Any'
                }, {
                    value: null,
                    option: 'active'
                }, {
                    value: !null,
                    option: 'disabled'
                }]
            }
        }],
            submit = function submit() {
            listVM.firstPage(filterVM.parameters()).then(null, function (serverError) {
                error(serverError.message);
            });
            return false;
        };

        return {
            filterVM: filterVM,
            filterBuilder: filterBuilder,
            listVM: {
                list: listVM,
                error: error
            },
            submit: submit
        };
    },
    view: function view(ctrl) {
        var label = 'Users';

        return m('', [m.component(adminFilter, {
            form: ctrl.filterVM.formDescriber,
            filterBuilder: ctrl.filterBuilder,
            label: label,
            submit: ctrl.submit
        }), m.component(adminList, {
            vm: ctrl.listVM,
            label: label,
            listItem: adminUserItem,
            listDetail: adminUserDetail
        })]);
    }
};

var contributionListVM = postgrest.paginationVM(models.contributionDetail, 'id.desc', { Prefer: 'count=exact' });

var vm$1 = postgrest$1.filtersVM({
    full_text_index: '@@',
    delivery_status: 'eq',
    state: 'eq',
    gateway: 'eq',
    value: 'between',
    created_at: 'between'
});
var paramToString$1 = function paramToString(p) {
    return (p || '').toString().trim();
};

// Set default values
vm$1.state('');
vm$1.delivery_status('');
vm$1.gateway('');
vm$1.order({
    id: 'desc'
});

vm$1.created_at.lte.toFilter = function () {
    var filter = paramToString$1(vm$1.created_at.lte());
    return filter && h.momentFromString(filter).endOf('day').format('');
};

vm$1.created_at.gte.toFilter = function () {
    var filter = paramToString$1(vm$1.created_at.gte());
    return filter && h.momentFromString(filter).format();
};

vm$1.full_text_index.toFilter = function () {
    var filter = paramToString$1(vm$1.full_text_index());
    return filter && replaceDiacritics(filter) || undefined;
};

var adminProject = {
    view: function view(ctrl, args) {
        var project = args.item;
        return m('.w-row.admin-project', [m('.w-col.w-col-3.w-col-small-3.u-marginbottom-10', [m('img.thumb-project.u-radius[src=' + project.project_img + '][width=50]')]), m('.w-col.w-col-9.w-col-small-9', [m('.fontweight-semibold.fontsize-smaller.lineheight-tighter.u-marginbottom-10', [m('a.alt-link[target="_blank"][href="/' + project.permalink + '"]', project.project_name)]), m('.fontsize-smallest.fontweight-semibold', project.project_state), m('.fontsize-smallest.fontcolor-secondary', h.momentify(project.project_online_date) + ' a ' + h.momentify(project.project_expires_at))])]);
    }
};

var adminContribution = {
    view: function view(ctrl, args) {
        var contribution = args.item;
        return m('.w-row.admin-contribution', [m('.fontweight-semibold.lineheight-tighter.u-marginbottom-10.fontsize-small', 'Rs' + contribution.value), m('.fontsize-smallest.fontcolor-secondary', h.momentify(contribution.created_at, 'DD/MM/YYYY HH:mm[h]')), m('.fontsize-smallest', ['Gateway ID: ', m('a.alt-link[target="_blank"][href="https://dashboard.pagar.me/#/transactions/' + contribution.gateway_id + '"]', contribution.gateway_id)])]);
    }
};

/**
 * window.c.AdminContributionUser component
 * An itembuilder component that returns additional data
 * to be included in AdminUser.
 *
 * Example:
 * controller: function() {
 *     return {
 *         itemBuilder: [{
 *             component: 'AdminContributionUser',
 *             wrapperClass: '.w-col.w-col-4'
 *         }]
 *     }
 * }
 */
var adminContributionUser = {
    view: function view(ctrl, args) {
        var item = args.item,
            user = {
            profile_img_thumbnail: item.user_profile_img,
            id: item.user_id,
            name: item.user_name,
            email: item.email
        };

        var additionalData = m('.fontsize-smallest.fontcolor-secondary', 'Gateway: ' + item.payer_email);
        return m.component(adminUser, { item: user, additional_data: additionalData });
    }
};

// Add translations to payment state.
var I18nScope$2 = _$1.partial(h.i18nScope, 'projects.payment');

var paymentStatus = {
    controller: function controller(args) {
        var payment = args.item;
        var card = null,
            displayPaymentMethod = void 0,
            paymentMethodClass = void 0,
            stateClass = void 0;

        card = function card() {
            if (payment.gateway_data) {
                switch (payment.gateway.toLowerCase()) {
                    case 'moip':
                        return {
                            first_digits: payment.gateway_data.cartao_bin,
                            last_digits: payment.gateway_data.cartao_final,
                            brand: payment.gateway_data.cartao_bandeira
                        };
                    case 'pagarme':
                        return {
                            first_digits: payment.gateway_data.card_first_digits,
                            last_digits: payment.gateway_data.card_last_digits,
                            brand: payment.gateway_data.card_brand
                        };
                }
            }
        };

        displayPaymentMethod = function displayPaymentMethod() {
            switch (payment.payment_method.toLowerCase()) {
                case 'boletobancario':
                    return m('span#boleto-detail', '');
                case 'cartaodecredito':
                    var cardData = card();
                    if (cardData) {
                        return m('#creditcard-detail.fontsize-smallest.fontcolor-secondary.lineheight-tight', [cardData.first_digits + '******' + cardData.last_digits, m('br'), cardData.brand + ' ' + payment.installments + 'x']);
                    }
                    return '';
            }
        };

        paymentMethodClass = function paymentMethodClass() {
            switch (payment.payment_method.toLowerCase()) {
                case 'boletobancario':
                    return '.fa-barcode';
                case 'cartaodecredito':
                    return '.fa-credit-card';
                default:
                    return '.fa-question';
            }
        };

        stateClass = function stateClass() {
            switch (payment.state) {
                case 'paid':
                    return '.text-success';
                case 'refunded':
                    return '.text-refunded';
                case 'pending':
                case 'pending_refund':
                    return '.text-waiting';
                default:
                    return '.text-error';
            }
        };

        return {
            displayPaymentMethod: displayPaymentMethod,
            paymentMethodClass: paymentMethodClass,
            stateClass: stateClass
        };
    },
    view: function view(ctrl, args) {
        var payment = args.item;

        return m('.w-row.payment-status', [m('.fontsize-smallest.lineheight-looser.fontweight-semibold', [m('span.fa.fa-circle' + ctrl.stateClass()), '\xA0' + I18n$1.t(payment.state, I18nScope$2())]), m('.fontsize-smallest.fontweight-semibold', [m('span.fa' + ctrl.paymentMethodClass()), ' ', m('a.link-hidden[href="#"]', payment.payment_method)]), m('.fontsize-smallest.fontcolor-secondary.lineheight-tight', [ctrl.displayPaymentMethod()])]);
    }
};

var adminContributionItem = {
    controller: function controller() {
        return {
            itemBuilder: [{
                component: adminContributionUser,
                wrapperClass: '.w-col.w-col-4'
            }, {
                component: adminProject,
                wrapperClass: '.w-col.w-col-4'
            }, {
                component: adminContribution,
                wrapperClass: '.w-col.w-col-2'
            }, {
                component: paymentStatus,
                wrapperClass: '.w-col.w-col-2'
            }]
        };
    },
    view: function view(ctrl, args) {
        return m('.w-row', _.map(ctrl.itemBuilder, function (panel) {
            return m(panel.wrapperClass, [m.component(panel.component, {
                item: args.item,
                key: args.key
            })]);
        }));
    }
};

var adminRadioAction = {
    controller: function controller(args) {
        var builder = args.data,
            complete = m.prop(false),
            data = {},
            error = m.prop(false),
            fail = m.prop(false),
            item = args.item(),
            description = m.prop(item.description || ''),
            key = builder.getKey,
            newID = m.prop(''),
            getFilter = {},
            setFilter = {},
            radios = m.prop([]),
            getAttr = builder.radios,
            getKey = builder.getKey,
            getKeyValue = args.getKeyValue,
            updateKey = builder.updateKey,
            updateKeyValue = args.updateKeyValue,
            validate = builder.validate,
            selectedItem = builder.selectedItem || m.prop();

        setFilter[updateKey] = 'eq';
        var setVM = postgrest.filtersVM(setFilter);
        setVM[updateKey](updateKeyValue);

        getFilter[getKey] = 'eq';
        var getVM = postgrest.filtersVM(getFilter);
        getVM[getKey](getKeyValue);

        var getLoader = postgrest.loaderWithToken(builder.getModel.getPageOptions(getVM.parameters()));

        var setLoader = postgrest.loaderWithToken(builder.updateModel.patchOptions(setVM.parameters(), data));

        var updateItem = function updateItem(data) {
            if (data.length > 0) {
                var newItem = _$1.findWhere(radios(), {
                    id: data[0][builder.selectKey]
                });
                selectedItem(newItem);
            } else {
                error({
                    message: 'No items updated'
                });
            }
            complete(true);
        };

        var populateRadios = function populateRadios(data) {
            var emptyState = builder.addEmpty;

            radios(data);

            if (!_$1.isUndefined(emptyState)) {
                radios().unshift(emptyState);
            }
        };

        var fetch = function fetch() {
            getLoader.load().then(populateRadios, error);
        };

        var submit = function submit() {
            if (newID()) {
                var validation = validate(radios(), newID());
                if (_$1.isUndefined(validation)) {
                    data[builder.selectKey] = newID() === -1 ? null : newID();
                    setLoader.load().then(updateItem, error);
                } else {
                    complete(true);
                    error({
                        message: validation
                    });
                }
            }
            return false;
        };

        var unload = function unload(el, isinit, context) {
            context.onunload = function () {
                complete(false);
                error(false);
                newID('');
            };
        };

        var setDescription = function setDescription(text) {
            description(text);
            m.redraw();
        };

        fetch();

        return {
            complete: complete,
            description: description,
            setDescription: setDescription,
            error: error,
            setLoader: setLoader,
            getLoader: getLoader,
            newID: newID,
            submit: submit,
            toggler: h.toggleProp(false, true),
            unload: unload,
            radios: radios
        };
    },
    view: function view(ctrl, args) {
        var data = args.data,
            item = args.item(),
            btnValue = ctrl.setLoader() || ctrl.getLoader() ? 'please wait...' : data.callToAction;

        return m('.w-col.w-col-2', [m('button.btn.btn-small.btn-terciary', {
            onclick: ctrl.toggler.toggle
        }, data.outerLabel), ctrl.toggler() ? m('.dropdown-list.card.u-radius.dropdown-list-medium.zindex-10', {
            config: ctrl.unload
        }, [m('form.w-form', {
            onsubmit: ctrl.submit
        }, !ctrl.complete() ? [ctrl.radios() ? _$1.map(ctrl.radios(), function (radio, index) {
            return m('.w-radio', [m('input#r-' + index + '.w-radio-input[type=radio][name="admin-radio"][value="' + radio.id + '"]', {
                checked: radio.id === (item[data.selectKey] || item.id),
                onclick: function onclick() {
                    ctrl.newID(radio.id);
                    ctrl.setDescription(radio.description);
                }
            }), m('label.w-form-label[for="r-' + index + '"]', 'Rs' + radio.minimum_value)]);
        }) : h.loader(), m('strong', 'Description'), m('p', ctrl.description()), m('input.w-button.btn.btn-small[type="submit"][value="' + btnValue + '"]')] : !ctrl.error() ? [m('.w-form-done[style="display:block;"]', [m('p', 'Reward changed successfully!')])] : [m('.w-form-error[style="display:block;"]', [m('p', ctrl.error().message)])])]) : '']);
    }
};

/**
 * window.c.AdminExternalAction component
 * Makes arbitrary ajax requests and update underlying
 * data from source endpoint.
 *
 * Example:
 * m.component(c.AdminExternalAction, {
 *     data: {},
 *     item: rowFromDatabase
 * })
 */
var adminExternalAction = {
    controller: function controller(args) {
        var builder = args.data,
            complete = m.prop(false),
            error = m.prop(false),
            fail = m.prop(false),
            data = {},
            item = args.item;

        builder.requestOptions.config = function (xhr) {
            if (h.authenticityToken()) {
                xhr.setRequestHeader('X-CSRF-Token', h.authenticityToken());
            }
        };

        var reload = _$1.compose(builder.model.getRowWithToken, h.idVM.id(item[builder.updateKey]).parameters),
            l = m.prop(false);

        var reloadItem = function reloadItem() {
            return reload().then(updateItem);
        };

        var requestError = function requestError(err) {
            l(false);
            complete(true);
            error(true);
        };

        var updateItem = function updateItem(res) {
            _$1.extend(item, res[0]);
            complete(true);
            error(false);
        };

        var submit = function submit() {
            l(true);
            m.request(builder.requestOptions).then(reloadItem, requestError);
            return false;
        };

        var unload = function unload(el, isinit, context) {
            context.onunload = function () {
                complete(false);
                error(false);
            };
        };

        return {
            l: l,
            complete: complete,
            error: error,
            submit: submit,
            toggler: h.toggleProp(false, true),
            unload: unload
        };
    },
    view: function view(ctrl, args) {
        var data = args.data,
            btnValue = ctrl.l() ? 'please wait...' : data.callToAction;

        return m('.w-col.w-col-2', [m('button.btn.btn-small.btn-terciary', {
            onclick: ctrl.toggler.toggle
        }, data.outerLabel), ctrl.toggler() ? m('.dropdown-list.card.u-radius.dropdown-list-medium.zindex-10', {
            config: ctrl.unload
        }, [m('form.w-form', {
            onsubmit: ctrl.submit
        }, !ctrl.complete() ? [m('label', data.innerLabel), m('input.w-button.btn.btn-small[type="submit"][value="' + btnValue + '"]')] : !ctrl.error() ? [m('.w-form-done[style="display:block;"]', [m('p', 'Request successful.')])] : [m('.w-form-error[style="display:block;"]', [m('p', 'There was a problem with the request.')])])]) : '']);
    }
};

var adminTransaction = {
    view: function view(ctrl, args) {
        var contribution = args.contribution;
        return m('.w-col.w-col-4', [m('.fontweight-semibold.fontsize-smaller.lineheight-tighter.u-marginbottom-20', 'Detalhes do apoio'), m('.fontsize-smallest.lineheight-looser', ['Value: Rs' + h.formatNumber(contribution.value, 2, 3), m('br'), 'Rate: Rs' + h.formatNumber(contribution.gateway_fee, 2, 3), m('br'), 'Waiting confirmation: ' + (contribution.waiting_payment ? 'Yes' : 'No'), m('br'), 'Anonymous: ' + (contribution.anonymous ? 'Yes' : 'No'), m('br'), 'Id payment: ' + contribution.gateway_id, m('br'), 'Support: ' + contribution.contribution_id, m('br'), 'Key: \n', m('br'), contribution.key, m('br'), 'Medium: ' + contribution.gateway, m('br'), 'Operator: ' + (contribution.gateway_data && contribution.gateway_data.acquirer_name), m('br'), contribution.is_second_slip ? [m('a.link-hidden[href="#"]', 'Bank slip'), ' ', m('span.badge', '2nd route')] : ''])]);
    }
};

var adminTransactionHistory = {
    controller: function controller(args) {
        var contribution = args.contribution,
            mapEvents = _$1.reduce([{
            date: contribution.paid_at,
            name: 'Support Confirmed'
        }, {
            date: contribution.pending_refund_at,
            name: 'Reimbursement Requested'
        }, {
            date: contribution.refunded_at,
            name: 'Reversal made'
        }, {
            date: contribution.created_at,
            name: 'Support created'
        }, {
            date: contribution.refused_at,
            name: 'Support canceled'
        }, {
            date: contribution.deleted_at,
            name: 'Support deleted'
        }, {
            date: contribution.chargeback_at,
            name: 'Chargeback'
        }], function (memo, item) {
            if (item.date !== null && item.date !== undefined) {
                item.originalDate = item.date;
                item.date = h.momentify(item.date, 'DD/MM/YYYY, HH:mm');
                return memo.concat(item);
            }

            return memo;
        }, []);

        return {
            orderedEvents: _$1.sortBy(mapEvents, 'originalDate')
        };
    },
    view: function view(ctrl) {
        return m('.w-col.w-col-4', [m('.fontweight-semibold.fontsize-smaller.lineheight-tighter.u-marginbottom-20', 'Transaction History'), ctrl.orderedEvents.map(function (cEvent) {
            return m('.w-row.fontsize-smallest.lineheight-looser.date-event', [m('.w-col.w-col-6', [m('.fontcolor-secondary', cEvent.date)]), m('.w-col.w-col-6', [m('div', cEvent.name)])]);
        })]);
    }
};

var adminReward = {
    controller: function controller(args) {
        var l = void 0;
        var loadShippingFee = function loadShippingFee() {
            var shippingFee = m.prop({});

            if (args.contribution.shipping_fee_id) {
                var options = models.shippingFee.getRowOptions(h.idVM.id(args.contribution.shipping_fee_id).parameters());

                l = postgrest$1.loaderWithToken(options);
                l.load().then(_.compose(shippingFee, _.first));
            }

            return shippingFee;
        };

        return {
            shippingFee: loadShippingFee()
        };
    },
    view: function view(ctrl, args) {
        var reward = args.reward(),
            contribution = args.contribution,
            available = parseInt(reward.paid_count) + parseInt(reward.waiting_payment_count),
            shippingFee = ctrl.shippingFee();

        return m('.w-col.w-col-4', [m('.fontweight-semibold.fontsize-smaller.lineheight-tighter.u-marginbottom-20', 'Reward'), m('.fontsize-smallest.lineheight-looser', reward.id ? ['ID: ' + reward.id, m('br'), 'Delivery place: ' + (shippingFee.destination ? shippingFee.destination + ' Rs ' + shippingFee.value : 'none'), m('br'), 'Send: ' + I18n.t('shared.shipping_options.' + reward.shipping_options), m('br'), 'Minimum value: Rs' + h.formatNumber(reward.minimum_value, 2, 3), m('br'), m.trust('Available: ' + available + ' / ' + (reward.maximum_contributions || '&infin;')), m('br'), 'Waiting confirmation: ' + reward.waiting_payment_count, m('br'), 'Estimated Delivery: ' + h.momentify(reward.deliver_at), m('br'), m('div', ['Delivery Status: ', h.contributionStatusBadge(contribution)]), reward.title ? ['Title: ' + reward.title, m('br')] : '', 'Description: ' + reward.description] : 'Support without reward')]);
    }
};

var adminContributionDetail = {
    controller: function controller(args) {
        var l = void 0;
        var loadReward = function loadReward() {
            var model = models.rewardDetail,
                reward_id = args.item.reward_id,
                opts = model.getRowOptions(h.idVM.id(reward_id).parameters()),
                reward = m.prop({});

            l = postgrest$1.loaderWithToken(opts);

            if (reward_id) {
                l.load().then(_$1.compose(reward, _$1.first));
            }

            return reward;
        };

        return {
            reward: loadReward(),
            actions: {
                transfer: {
                    property: 'user_id',
                    updateKey: 'id',
                    callToAction: 'Transfer',
                    innerLabel: 'Id of new supporter:',
                    outerLabel: 'Download Support',
                    placeholder: 'ex: 129908',
                    successMessage: 'Support transferred successfully!',
                    errorMessage: 'Support has not been transferred!',
                    model: models.contributionDetail
                },
                reward: {
                    getKey: 'project_id',
                    updateKey: 'contribution_id',
                    selectKey: 'reward_id',
                    radios: 'rewards',
                    callToAction: 'Change Reward',
                    outerLabel: 'Reward',
                    getModel: models.rewardDetail,
                    updateModel: models.contributionDetail,
                    selectedItem: loadReward(),
                    addEmpty: { id: -1, minimum_value: 10, description: 'No reward' },
                    validate: function validate(rewards, newRewardID) {
                        var reward = _$1.findWhere(rewards, { id: newRewardID });
                        return args.item.value >= reward.minimum_value ? undefined : 'Minimum reward value is greater than the contribution amount.';
                    }
                },
                refund: {
                    updateKey: 'id',
                    callToAction: 'Direct refund',
                    innerLabel: 'Are you sure you want to reimburse this support?',
                    outerLabel: 'Refund Support',
                    model: models.contributionDetail
                },
                remove: {
                    property: 'state',
                    updateKey: 'id',
                    callToAction: 'Delete',
                    innerLabel: 'Are you sure you want to delete this support?',
                    outerLabel: 'Delete Support',
                    forceValue: 'deleted',
                    successMessage: 'Support removed successfully!',
                    errorMessage: 'Support has not been removed!',
                    model: models.contributionDetail
                }
            },
            l: l
        };
    },
    view: function view(ctrl, args) {
        var actions = ctrl.actions,
            item = args.item,
            reward = ctrl.reward,
            addOptions = function addOptions(builder, id) {
            return _$1.extend({}, builder, {
                requestOptions: {
                    url: '/admin/contributions/' + id + '/gateway_refund',
                    method: 'PUT'
                }
            });
        };

        return m('#admin-contribution-detail-box', [m('.divider.u-margintop-20.u-marginbottom-20'), m('.w-row.u-marginbottom-30', [m.component(adminInputAction, {
            data: actions.transfer,
            item: item
        }), ctrl.l() ? h.loader : m.component(adminRadioAction, {
            data: actions.reward,
            item: reward,
            getKeyValue: item.project_id,
            updateKeyValue: item.contribution_id
        }), m.component(adminExternalAction, {
            data: addOptions(actions.refund, item.id),
            item: item
        }), m.component(adminInputAction, {
            data: actions.remove,
            item: item
        })]), m('.w-row.card.card-terciary.u-radius', [m.component(adminTransaction, {
            contribution: item
        }), m.component(adminTransactionHistory, {
            contribution: item
        }), ctrl.l() ? h.loader : m.component(adminReward, {
            reward: reward,
            contribution: item,
            key: item.key
        })])]);
    }
};

var filterNumberRange = {
    view: function view(ctrl, args) {
        return m('.w-col.w-col-3.w-col-small-6', [m('label.fontsize-smaller[for="' + args.index + '"]', args.label), m('.w-row', [m('.w-col.w-col-5.w-col-small-5.w-col-tiny-5', [m('input.w-input.text-field.positive[id="' + args.index + '"][type="text"]', {
            onchange: m.withAttr('value', args.first),
            value: args.first()
        })]), m('.w-col.w-col-2.w-col-small-2.w-col-tiny-2', [m('.fontsize-smaller.u-text-center.lineheight-looser', 'and')]), m('.w-col.w-col-5.w-col-small-5.w-col-tiny-5', [m('input.w-input.text-field.positive[type="text"]', {
            onchange: m.withAttr('value', args.last),
            value: args.last()
        })])])]);
    }
};

var dateFieldMask = _$1.partial(h.mask, '99/99/9999');

var filterDateRange = {
    view: function view(ctrl, args) {
        return m('.w-col.w-col-3.w-col-small-6', [m('label.fontsize-smaller[for="' + args.index + '"]', args.label), m('.w-row', [m('.w-col.w-col-5.w-col-small-5.w-col-tiny-5', [m('input.w-input.text-field.positive[id="' + args.index + '"][type="text"]', {
            onkeyup: m.withAttr('value', _$1.compose(args.first, dateFieldMask)),
            value: args.first()
        })]), m('.w-col.w-col-2.w-col-small-2.w-col-tiny-2', [m('.fontsize-smaller.u-text-center.lineheight-looser', 'e')]), m('.w-col.w-col-5.w-col-small-5.w-col-tiny-5', [m('input.w-input.text-field.positive[type="text"]', {
            onkeyup: m.withAttr('value', _$1.compose(args.last, dateFieldMask)),
            value: args.last()
        })])])]);
    }
};

var adminContributions = {
    controller: function controller() {
        var listVM = contributionListVM,
            filterVM = vm$1,
            error = m.prop(''),
            filterBuilder = [{ // full_text_index
            component: filterMain,
            data: {
                vm: filterVM.full_text_index,
                placeholder: 'Search by Design, Email, User and Support Ids...'
            }
        }, { // delivery_status
            component: filterDropdown,
            data: {
                label: 'Delivery Status',
                name: 'delivery_status',
                vm: filterVM.delivery_status,
                options: [{
                    value: '',
                    option: 'Qualquer um'
                }, {
                    value: 'delivered',
                    option: 'delivered'
                }, {
                    value: 'undelivered',
                    option: 'undelivered'
                }, {
                    value: 'error',
                    option: 'error'
                }, {
                    value: 'received',
                    option: 'received'
                }]
            }
        }, { // state
            component: filterDropdown,
            data: {
                label: 'With the state',
                name: 'state',
                vm: filterVM.state,
                options: [{
                    value: '',
                    option: 'Any'
                }, {
                    value: 'paid',
                    option: 'paid'
                }, {
                    value: 'refused',
                    option: 'refused'
                }, {
                    value: 'pending',
                    option: 'pending'
                }, {
                    value: 'pending_refund',
                    option: 'pending_refund'
                }, {
                    value: 'refunded',
                    option: 'refunded'
                }, {
                    value: 'chargeback',
                    option: 'chargeback'
                }, {
                    value: 'deleted',
                    option: 'deleted'
                }]
            }
        }, { // gateway
            component: filterDropdown,
            data: {
                label: 'gateway',
                name: 'gateway',
                vm: filterVM.gateway,
                options: [{
                    value: '',
                    option: 'Any'
                }, {
                    value: 'Pagarme',
                    option: 'Pagarme'
                }, {
                    value: 'MoIP',
                    option: 'MoIP'
                }, {
                    value: 'PayPal',
                    option: 'PayPal'
                }, {
                    value: 'Credits',
                    option: 'Credits'
                }]
            }
        }, { // value
            component: filterNumberRange,
            data: {
                label: 'Values between',
                first: filterVM.value.gte,
                last: filterVM.value.lte
            }
        }, { // created_at
            component: filterDateRange,
            data: {
                label: 'Support period',
                first: filterVM.created_at.gte,
                last: filterVM.created_at.lte
            }
        }],
            submit = function submit() {
            error(false);
            listVM.firstPage(filterVM.parameters()).then(null, function (serverError) {
                error(serverError.message);
            });
            return false;
        };

        return {
            filterVM: filterVM,
            filterBuilder: filterBuilder,
            listVM: {
                list: listVM,
                error: error
            },
            data: {
                label: 'Support'
            },
            submit: submit
        };
    },
    view: function view(ctrl) {
        return m('#admin-root-contributions', [m.component(adminFilter, {
            form: ctrl.filterVM.formDescriber,
            filterBuilder: ctrl.filterBuilder,
            submit: ctrl.submit
        }), m.component(adminList, {
            vm: ctrl.listVM,
            listItem: adminContributionItem,
            listDetail: adminContributionDetail
        })]);
    }
};

var balanceTransferListVM = postgrest.paginationVM(models.balanceTransfer, 'id.desc', { Prefer: 'count=exact' });

var vm$2 = postgrest$1.filtersVM({
    full_text_index: '@@',
    state: 'eq',
    transfer_id: 'eq',
    created_date: 'between',
    transferred_date: 'between',
    amount: 'between'
});

var paramToString$2 = function paramToString(p) {
    return (p || '').toString().trim();
};

vm$2.state('');
vm$2.transfer_id('');

vm$2.created_date.lte.toFilter = function () {
    var filter = paramToString$2(vm$2.created_date.lte());
    return filter && h.momentFromString(filter).endOf('day').format('');
};

vm$2.created_date.gte.toFilter = function () {
    var filter = paramToString$2(vm$2.created_date.gte());
    return filter && h.momentFromString(filter).endOf('day').format('');
};

vm$2.transferred_date.lte.toFilter = function () {
    var filter = paramToString$2(vm$2.transferred_date.lte());
    return filter && h.momentFromString(filter).endOf('day').format('');
};

vm$2.transferred_date.gte.toFilter = function () {
    var filter = paramToString$2(vm$2.transferred_date.gte());
    return filter && h.momentFromString(filter).endOf('day').format('');
};

vm$2.getAllBalanceTransfers = function (filterVM) {
    models.balanceTransfer.pageSize(false);
    var allTransfers = postgrest$1.loaderWithToken(models.balanceTransfer.getPageOptions(filterVM.parameters())).load();
    models.balanceTransfer.pageSize(9);
    return allTransfers;
};

/**
 * window.c.ModalBox component
 * Buils the template for using modal
 *
 * Example:
 * m.component(c.ModalBox, {
 *     displayModal: tooglePropObject,
 *     content: ['ComponentName', {argx: 'x', argy: 'y'}]
 * })
 * ComponentName structure =>  m('div', [
 *                  m('.modal-dialog-header', []),
 *                  m('.modal-dialog-content', []),
 *                  m('.modal-dialog-nav-bottom', []),
 *              ])
 */
var modalBox = {
    view: function view(ctrl, args) {
        return m('.modal-backdrop', [m('.modal-dialog-outer', [m('.modal-dialog-inner.modal-dialog-small', [m('a.w-inline-block.fa.fa-lg.modal-close' + (args.hideCloseButton ? '' : '.fa-close') + '[href="javascript:void(0);"]', {
            onclick: args.displayModal.toggle
        }), m.component(args.content[0], args.content[1])])])]);
    }
};

var adminBalanceTransferItem = {
    view: function view(ctrl, args) {
        var item = args.item;
        return m('.w-row', [m('.w-col.w-col-1.w-col-tiny-1', [m('.w-checkbox.w-clearfix', [m('input.w-checkbox-input[type=\'checkbox\']', {
            disabled: item.state != 'pending',
            checked: args.listWrapper.isSelected(item.id),
            onchange: function onchange(event) {
                if (event.currentTarget.checked) {
                    args.listWrapper.selectItem(item);
                } else {
                    args.listWrapper.unSelectItem(item);
                }
            }
        })])]), m('.w-col.w-col-3', [m('.fontsize-smaller.fontweight-semibold.lineheight-tighter', ['' + item.user_name, m('span.fontcolor-secondary.fontsize-smallest', '(' + item.user_public_name + ')')]), m('.fontcolor-secondary.fontsize-smallest', item.user_email), m('.fontcolor-secondary.fontsize-smallest', 'USER_ID: ' + item.user_id)]), m('.w-col.w-col-2', [m('span.fontsize-small', 'R$ ' + h.formatNumber(item.amount, 2, 3))]), m('.w-col.w-col-2.w-hidden-small.w-hidden-tiny', [m('span', item.state), item.transfer_id ? m('.fontcolor-secondary.fontsize-smallest', m('a[href="https://dashboard.pagar.me/#/transfers/' + item.transfer_id + '"]', 'ID: ' + item.transfer_id)) : '']), m('.w-col.w-col-2', [m('.fontsize-smallest', ['Solicitado em: ', m('span.fontsize-small.lineheight-tightest', h.momentify(item.created_at)), m('br'), m('span.fontsize-smallest.lineheight-tightest', '(' + h.momentify(item.transfer_limit_date) + ')')])]), m('.w-col.w-col-2', [m('.fontsize-smallest', ['Confirmado em: ', item.transferred_at ? m('span.fontsize-small.lineheight-tightest', h.momentify(item.transferred_at)) : ''])])]);
    }
};

var popNotification = {
    controller: function controller(args) {
        var displayNotification = args.toggleOpt || h.toggleProp(true, false),
            setPopTimeout = function setPopTimeout() {
            setTimeout(function () {
                displayNotification(false);m.redraw();
            }, 3000);
        };
        return {
            displayNotification: displayNotification,
            setPopTimeout: setPopTimeout
        };
    },
    view: function view(ctrl, args) {
        return ctrl.displayNotification() ? m('.flash.w-clearfix.card.card-notification.u-radius.zindex-20', {
            config: ctrl.setPopTimeout,
            class: args.error ? 'card-error' : ''
        }, [m('img.icon-close[src="/assets/catarse_bootstrap/x.png"][width="12"][alt="close"]', {
            onclick: ctrl.displayNotification.toggle
        }), m('.fontsize-small', m.trust(args.message))]) : m('span');
    }
};

var I18nScope$3 = _$1.partial(h.i18nScope, 'admin.balance_transfers');

var adminBalanceTransferItemDetail = {
    controller: function controller(args) {
        var userBankAccount = m.prop(null),
            showPopNotification = m.prop(false),
            popNotificationAttributes = m.prop({}),
            metadata = args.item.last_transition_metadata || { transfer_data: {} },
            transferData = metadata.transfer_data || {},
            metaBank = transferData.bank_account,
            userBalance = m.prop({}),
            transitionBankAccount = m.prop({}),
            fields = {
            admin_notes: m.prop(args.item.admin_notes)
        },
            loadingNotes = m.prop(false),
            submitNotes = function submitNotes() {
            loadingNotes(true);
            m.request({
                method: 'PUT',
                url: '/admin/balance_transfers/' + args.item.id,
                data: {
                    balance_transfer: {
                        admin_notes: fields.admin_notes()
                    }
                },
                config: h.setCsrfToken
            }).then(function (data) {
                showPopNotification(true);
                popNotificationAttributes({
                    message: I18n$1.t('admin_notes.success_update', I18nScope$3()),
                    toggleOpt: showPopNotification
                });
                loadingNotes(false);
            }, function (err) {
                showPopNotification(true);
                popNotificationAttributes({
                    message: I18n$1.t('admin_notes.failed_update', I18nScope$3()),
                    error: true,
                    toggleOpt: showPopNotification
                });
                loadingNotes(false);
            });
        };

        if (!_$1.isUndefined(metaBank)) {
            if (metaBank.conta) {
                transitionBankAccount({
                    account: metaBank.conta,
                    account_digit: metaBank.conta_dv,
                    account_type: null,
                    agency: metaBank.agencia,
                    agency_digit: metaBank.agencia_dv,
                    bank_code: metaBank.bank_code,
                    bank_name: null,
                    owner_document: metaBank.document_number,
                    owner_name: metaBank.legal_name
                });
            } else {
                transitionBankAccount(metaBank);
            }
        }

        userVM.getUserBankAccount(args.item.user_id).then(_$1.compose(userBankAccount, _$1.first));

        return {
            metaBank: metaBank,
            userBankAccount: userBankAccount,
            transitionBankAccount: transitionBankAccount,
            userBalance: userBalance,
            fields: fields,
            submitNotes: submitNotes,
            loadingNotes: loadingNotes,
            showPopNotification: showPopNotification,
            popNotificationAttributes: popNotificationAttributes
        };
    },
    view: function view(ctrl, args) {
        var bankAccount = _$1.isUndefined(ctrl.metaBank) ? ctrl.userBankAccount() : ctrl.transitionBankAccount();

        return m('#admin-balance-transfer-item-detail-box', [m('.divider.u-margintop-20.u-marginbottom-20'), m('.w-row.card.card-terciary.u-radius', [m('.w-col.w-col-4', [bankAccount ? [m('.fontsize-smaller.fontweight-semibold.lineheight-tighter.u-marginbottom-20', 'Dados bancários'), m('.fontsize-smallest.lineheight-looser', [m('span.fontweight-semibold', 'Banco:'), bankAccount.bank_code + ' - ' + (bankAccount.bank_name ? bankAccount.bank_name : ''), m('br'), m('span.fontweight-semibold', 'Agencia:'), ' ' + bankAccount.agency + ' - ' + (bankAccount.agency_digit ? bankAccount.agency_digit : ''), m('br'), m('span.fontweight-semibold', "Conta:"), ' ' + bankAccount.account + ' - ' + (bankAccount.account_digit ? bankAccount.account_digit : ''), m('br'), m('span.fontweight-semibold', 'Nome:'), bankAccount.owner_name, m('br'), m('span.fontweight-semibold', 'CPF:'), bankAccount.owner_document])] : h.loader(), ctrl.loadingNotes() ? h.loader() : m('', [m('textarea.text-field.height-mini.w-input', {
            value: ctrl.fields.admin_notes(),
            onkeyup: m.withAttr('value', ctrl.fields.admin_notes)
        }), m('.u-text-center', m('button.btn.btn-terciary', {
            onclick: ctrl.submitNotes
        }, I18n$1.t('shared.save_text'))), ctrl.showPopNotification() ? m(popNotification, ctrl.popNotificationAttributes()) : ''])]), m(adminUserBalanceTransactionsList, { user_id: args.item.user_id })])]);
    }
};

var adminBalanceTranfers = {
    controller: function controller(args) {
        var listVM = balanceTransferListVM,
            filterVM = vm$2,
            error = m.prop(''),
            selectedAny = m.prop(false),
            filterBuilder = [{
            component: filterMain,
            data: {
                vm: filterVM.full_text_index,
                placeholder: 'Search for email hair, user ids, transfer ids and balance events'
            }
        }, {
            component: filterDropdown,
            data: {
                label: 'Status',
                name: 'state',
                vm: filterVM.state,
                options: [{
                    value: '',
                    option: 'Qualquer um'
                }, {
                    value: 'pending',
                    option: 'Pendente'
                }, {
                    value: 'authorized',
                    option: 'Autorizado'
                }, {
                    value: 'processing',
                    option: 'Processando'
                }, {
                    value: 'transferred',
                    option: 'Concluido'
                }, {
                    value: 'error',
                    option: 'Erro'
                }, {
                    value: 'rejected',
                    option: 'Rejeitado'
                }, {
                    value: 'gateway_error',
                    option: 'Erro no gateway'
                }]
            }
        }, {
            component: filterDateRange,
            data: {
                label: 'Data da solicitação',
                first: filterVM.created_date.gte,
                last: filterVM.created_date.lte
            }

        }, {
            component: filterDateRange,
            data: {
                label: 'Data da confirmação',
                first: filterVM.transferred_date.gte,
                last: filterVM.transferred_date.lte
            }

        }, {
            component: filterNumberRange,
            data: {
                label: 'Valores entre',
                first: filterVM.amount.gte,
                last: filterVM.amount.lte
            }
        }],
            selectedItemsIDs = m.prop([]),
            displayApprovalModal = h.toggleProp(false, true),
            displayManualModal = h.toggleProp(false, true),
            displayRejectModal = h.toggleProp(false, true),
            selectAllLoading = m.prop(false),
            redrawProp = m.prop(false),
            actionMenuToggle = h.toggleProp(false, true),
            isSelected = function isSelected(item_id) {
            return _$1.find(selectedItemsIDs(), function (i) {
                return i.id == item_id;
            });
        },
            selectItem = function selectItem(item) {
            if (!_$1.find(selectedItemsIDs(), function (i) {
                return i.id == item.id;
            })) {
                selectedItemsIDs().push(item);
            }
            selectedAny(true);
        },
            unSelectItem = function unSelectItem(item) {
            var newIDs = _$1.reject(selectedItemsIDs(), function (i) {
                return i.id == item.id;
            });
            selectedItemsIDs(newIDs);
            if (_$1.isEmpty(newIDs)) {
                selectedAny(false);
            }
        },
            submit = function submit() {
            error(false);
            listVM.firstPage(filterVM.parameters()).then(null, function (serverError) {
                error(serverError.message);
            });

            return false;
        },
            generateWrapperModal = function generateWrapperModal(customAttrs) {
            var wrapper = {
                view: function view(ctrl, args) {
                    actionMenuToggle(false);
                    return m('', [m('.modal-dialog-header', [m('.fontsize-large.u-text-center', args.modalTitle)]), m('.modal-dialog-content', [m('.w-row.fontweight-semibold', [m('.w-col.w-col-6', 'Nome'), m('.w-col.w-col-3', 'Valor'), m('.w-col.w-col-3', 'Solicitado em')]), _$1.map(selectedItemsIDs(), function (item, index) {
                        return m('.divider.fontsize-smallest.lineheight-looser', [m('.w-row', [m('.w-col.w-col-6', [m('span', item.user_name)]), m('.w-col.w-col-3', [m('span', 'Rs ' + h.formatNumber(item.amount, 2, 3))]), m('.w-col.w-col-3', [m('span', h.momentify(item.created_at))])])]);
                    }), m('.w-row.fontweight-semibold.divider', [m('.w-col.w-col-6', 'Total'), m('.w-col.w-col-3', 'Rs ' + h.formatNumber(_$1.reduce(selectedItemsIDs(), function (t, i) {
                        return t + i.amount;
                    }, 0), 2, 3)), m('.w-col.w-col-3')]), m('.w-row.u-margintop-40', [m('.w-col.w-col-1'), m('.w-col.w-col-5', m('a.btn.btn-medium.w-button', {
                        onclick: args.onClickCallback
                    }, args.ctaText)), m('.w-col.w-col-5', m('a.btn.btn-medium.btn-terciary.w-button', {
                        onclick: args.displayModal.toggle
                    }, 'Voltar')), m('.w-col.w-col-1')])])]);
                }
            };

            return [wrapper, customAttrs];
        },
            manualTransferSelectedIDs = function manualTransferSelectedIDs() {
            m.request({
                method: 'POST',
                url: '/admin/balance_transfers/batch_manual',
                data: {
                    transfer_ids: _$1.uniq(_$1.map(selectedItemsIDs(), function (s) {
                        return s.id;
                    }))
                },
                config: h.setCsrfToken
            }).then(function (data) {
                selectedItemsIDs([]);
                listVM.firstPage(filterVM.parameters());
                displayManualModal(false);
                m.redraw();
            });
        },
            approveSelectedIDs = function approveSelectedIDs() {
            m.request({
                method: 'POST',
                url: '/admin/balance_transfers/batch_approve',
                data: {
                    transfer_ids: _$1.uniq(_$1.map(selectedItemsIDs(), function (s) {
                        return s.id;
                    }))
                },
                config: h.setCsrfToken
            }).then(function (data) {
                selectedItemsIDs([]);
                listVM.firstPage(filterVM.parameters());
                displayApprovalModal(false);
                m.redraw();
            });
        },
            rejectSelectedIDs = function rejectSelectedIDs() {
            m.request({
                method: 'POST',
                url: '/admin/balance_transfers/batch_reject',
                data: {
                    transfer_ids: _$1.uniq(_$1.map(selectedItemsIDs(), function (s) {
                        return s.id;
                    }))
                },
                config: h.setCsrfToken
            }).then(function (data) {
                selectedItemsIDs([]);
                displayRejectModal(false);
                listVM.firstPage();
                m.redraw();
            });
        },
            unSelectAll = function unSelectAll() {
            selectedItemsIDs([]);
            selectedAny(false);
        },
            selectAll = function selectAll() {
            selectAllLoading(true);
            m.redraw();
            filterVM.getAllBalanceTransfers(filterVM).then(function (data) {
                _$1.map(_$1.where(data, { state: 'pending' }), selectItem);
                selectAllLoading(false);
                m.redraw();
            });
        },
            inputActions = function inputActions() {
            return m('', [m('button.btn.btn-inline.btn-small.btn-terciary.u-marginright-20.w-button', { onclick: selectAll }, selectAllLoading() ? 'carregando...' : 'Selecionar todos'), selectedItemsIDs().length > 1 ? m('button.btn.btn-inline.btn-small.btn-terciary.u-marginright-20.w-button', { onclick: unSelectAll }, 'Desmarcar todos (' + selectedItemsIDs().length + ')') : '', selectedAny() ? m('.w-inline-block', [m('button.btn.btn-inline.btn-small.btn-terciary.w-button', {
                onclick: actionMenuToggle.toggle
            }, ['Marcar como (' + selectedItemsIDs().length + ')']), actionMenuToggle() ? m('.card.dropdown-list.dropdown-list-medium.u-radius.zindex-10[id=\'transfer\']', [m('a.dropdown-link.fontsize-smaller[href=\'javascript:void(0);\']', {
                onclick: function onclick(event) {
                    return displayApprovalModal.toggle();
                }
            }, 'Aprovada'), m('a.dropdown-link.fontsize-smaller[href=\'javascript:void(0);\']', {
                onclick: function onclick(event) {
                    return displayManualModal.toggle();
                }
            }, 'Transferencia manual'), m('a.dropdown-link.fontsize-smaller[href=\'javascript:void(0);\']', {
                onclick: function onclick(event) {
                    return displayRejectModal.toggle();
                }
            }, 'Recusada')]) : '']) : '']);
        };

        return {
            displayApprovalModal: displayApprovalModal,
            displayRejectModal: displayRejectModal,
            displayManualModal: displayManualModal,
            generateWrapperModal: generateWrapperModal,
            approveSelectedIDs: approveSelectedIDs,
            manualTransferSelectedIDs: manualTransferSelectedIDs,
            rejectSelectedIDs: rejectSelectedIDs,
            filterVM: filterVM,
            filterBuilder: filterBuilder,
            listVM: {
                hasInputAction: true,
                inputActions: inputActions,
                list: listVM,
                selectedItemsIDs: selectedItemsIDs,
                selectItem: selectItem,
                unSelectItem: unSelectItem,
                selectedAny: selectedAny,
                isSelected: isSelected,
                redrawProp: redrawProp,
                error: error
            },
            data: {
                label: 'Pedidos de saque'
            },
            submit: submit
        };
    },
    view: function view(ctrl, args) {
        return m('', [m(adminFilter, {
            filterBuilder: ctrl.filterBuilder,
            submit: ctrl.submit
        }), ctrl.displayApprovalModal() ? m(modalBox, {
            displayModal: ctrl.displayApprovalModal,
            content: ctrl.generateWrapperModal({
                modalTitle: 'Aprovar saques',
                ctaText: 'Aprovar',
                displayModal: ctrl.displayApprovalModal,
                onClickCallback: ctrl.approveSelectedIDs
            })
        }) : '', ctrl.displayManualModal() ? m(modalBox, {
            displayModal: ctrl.displayManualModal,
            content: ctrl.generateWrapperModal({
                modalTitle: 'Transferencia manual de saques',
                ctaText: 'Aprovar',
                displayModal: ctrl.displayManualModal,
                onClickCallback: ctrl.manualTransferSelectedIDs
            })
        }) : '', ctrl.displayRejectModal() ? m(modalBox, {
            displayModal: ctrl.displayRejectModal,
            content: ctrl.generateWrapperModal({
                modalTitle: 'Rejeitar saques',
                ctaText: 'Rejeitar',
                displayModal: ctrl.displayRejectModal,
                onClickCallback: ctrl.rejectSelectedIDs
            })
        }) : '', m(adminList, {
            vm: ctrl.listVM,
            listItem: adminBalanceTransferItem,
            listDetail: adminBalanceTransferItemDetail
        })]);
    }
};

/**
 * window.c.landingSignup component
 * A visual component that displays signup email typically used on landing pages.
 * It accepts a custom form action to attach to third-party services like Mailchimp
 *
 * Example:
 * view: () => {
 *      ...
 *      m.component(c.landingSignup, {
 *          builder: {
 *              customAction: 'http://formendpoint.com'
 *          }
 *      })
 *      ...
 *  }
 */
var landingSignup = {
    controller: function controller(args) {
        var builder = args.builder,
            email = m.prop(''),
            error = m.prop(false),
            submit = function submit() {
            if (h.validateEmail(email())) {
                return true;
            }
            error(true);
            return false;
        };
        return {
            email: email,
            submit: submit,
            error: error
        };
    },
    view: function view(ctrl, args) {
        var errorClasses = !ctrl.error ? '.positive.error' : '';
        return m('form.w-form[id="email-form"][method="post"][action="' + args.builder.customAction + '"]', {
            onsubmit: ctrl.submit
        }, [m('.w-col.w-col-5', [m('input' + errorClasses + '.w-input.text-field.medium[name="EMAIL"][placeholder="Type your e-mail"][type="text"]', {
            config: h.RDTracker('landing-flex'),
            onchange: m.withAttr('value', ctrl.email),
            value: ctrl.email()
        }), ctrl.error() ? m('span.fontsize-smaller.text-error', 'invalid E-mail') : '']), m('.w-col.w-col-3', [m('input.w-button.btn.btn-large[type="submit"][value="Register"]')])]);
    }
};

var error$1 = m.prop('');
var rewards = m.prop([]);
var states = m.prop([]);
var fees = m.prop([]);
var noReward = {
    id: -1,
    description: 'Thank you. I just want to help the project.',
    minimum_value: 100
};
var contributionValue = m.prop('' + noReward.minimum_value);
var selectedReward = m.prop(noReward);
var vm$4 = postgrest$1.filtersVM({
    project_id: 'eq'
});

var rewardsLoader = function rewardsLoader(projectId) {
    vm$4.project_id(projectId);

    return postgrest$1.loaderWithToken(models.rewardDetail.getPageOptions(vm$4.parameters()));
};

var fetchRewards = function fetchRewards(projectId) {
    return rewardsLoader(projectId).load().then(rewards);
};

var getFees = function getFees(reward) {
    var feesFilter = postgrest$1.filtersVM({
        reward_id: 'eq'
    });

    feesFilter.reward_id(reward.id);
    var feesLoader = postgrest$1.loader(models.shippingFee.getPageOptions(feesFilter.parameters()));
    return feesLoader.load();
};

var getSelectedReward = function getSelectedReward() {
    var root = document.getElementById('application'),
        data = root && root.getAttribute('data-contribution');

    if (data) {
        var contribution = JSON.parse(data);

        selectedReward(contribution.reward);
        m.redraw(true);

        return selectedReward;
    }

    return false;
};

var selectReward = function selectReward(reward) {
    return function () {
        if (selectedReward() !== reward) {
            error$1('');
            selectedReward(reward);
            // contributionValue(h.applyMonetaryMask(`${reward.minimum_value},00`));
            contributionValue(h.numbersOnlyMask('' + reward.minimum_value));
            if (reward.id) {
                getFees(reward).then(fees);
            }
        }
    };
};

// const applyMask = _.compose(contributionValue, h.applyMonetaryMask);
var applyMask$1 = _$1.compose(contributionValue, h.numbersOnlyMask);

var statesLoader = postgrest$1.loader(models.state.getPageOptions());
var getStates = function getStates() {
    statesLoader.load().then(states);
    return states;
};

var locationOptions = function locationOptions(reward, destination) {
    var options = m.prop([]),
        mapStates = _$1.map(states(), function (state) {
        var fee = void 0;
        var feeState = _$1.findWhere(fees(), {
            destination: state.acronym
        });
        var feeOthers = _$1.findWhere(fees(), {
            destination: 'others'
        });
        if (feeState) {
            fee = feeState.value;
        } else if (feeOthers) {
            fee = feeOthers.value;
        }

        return {
            name: state.name,
            value: state.acronym,
            fee: fee
        };
    });
    if (reward.shipping_options === 'national') {
        options(mapStates);
    } else if (reward.shipping_options === 'international') {
        var fee = void 0;
        var feeInternational = _$1.findWhere(fees(), {
            destination: 'international'
        });
        if (feeInternational) {
            fee = feeInternational.value;
        }
        options(_$1.union([{
            value: 'international',
            name: 'Outside Brazil',
            fee: fee
        }], mapStates));
    }

    options(_$1.union([{ value: '', name: 'Selecione Opção', fee: 0 }], options()));

    return options();
};

var shippingFeeById = function shippingFeeById(feeId) {
    return _$1.findWhere(fees(), {
        id: feeId
    });
};

var getOtherNationalStates = function getOtherNationalStates() {
    return _$1.reject(states(), function (state) {
        return !_$1.isUndefined(_$1.findWhere(fees(), { destination: state.acronym }));
    });
};

var feeDestination = function feeDestination(reward, feeId) {
    var fee = shippingFeeById(feeId) || {};
    var feeState = _$1.findWhere(states(), { acronym: fee.destination });

    if (feeState) {
        return feeState.acronym;
    } else if (reward.shipping_options === 'national' && fee.destination === 'others') {
        return _$1.pluck(getOtherNationalStates(fees), 'acronym').join(', ');
    }

    return fee.destination;
};

var shippingFeeForCurrentReward = function shippingFeeForCurrentReward(selectedDestination) {
    var currentFee = _$1.findWhere(fees(), {
        destination: selectedDestination()
    });

    if (!currentFee && _$1.findWhere(states(), { acronym: selectedDestination() })) {
        currentFee = _$1.findWhere(fees(), {
            destination: 'others'
        });
    }

    return currentFee;
};

var canEdit = function canEdit(reward, projectState, user) {
    return (user || {}).is_admin || projectState === 'draft' || projectState === 'online' && reward.paid_count <= 0 && reward.waiting_payment_count <= 0;
};

var canAdd = function canAdd(projectState, user) {
    return (user || {}).is_admin || projectState === 'draft' || projectState === 'online';
};

var hasShippingOptions = function hasShippingOptions(reward) {
    return !(_$1.isNull(reward.shipping_options) || reward.shipping_options === 'free' || reward.shipping_options === 'presential');
};

var rewardVM = {
    canEdit: canEdit,
    canAdd: canAdd,
    error: error$1,
    getStates: getStates,
    getFees: getFees,
    fees: fees,
    rewards: rewards,
    applyMask: applyMask$1,
    noReward: noReward,
    fetchRewards: fetchRewards,
    selectReward: selectReward,
    getSelectedReward: getSelectedReward,
    selectedReward: selectedReward,
    contributionValue: contributionValue,
    rewardsLoader: rewardsLoader,
    locationOptions: locationOptions,
    shippingFeeForCurrentReward: shippingFeeForCurrentReward,
    shippingFeeById: shippingFeeById,
    statesLoader: statesLoader,
    feeDestination: feeDestination,
    getValue: contributionValue,
    setValue: contributionValue,
    hasShippingOptions: hasShippingOptions
};

var currentProject$1 = m.prop();
var userDetails = m.prop();
var projectContributions = m.prop([]);
var vm$3 = postgrest$1.filtersVM({ project_id: 'eq' });
var idVM$2 = h.idVM;

var setProject$1 = function setProject(project_user_id) {
    return function (data) {
        currentProject$1(_$1.first(data));

        if (!project_user_id) {
            userVM.fetchUser(currentProject$1().user_id, true, userDetails);
        }

        return currentProject$1;
    };
};

var init = function init(project_id, project_user_id) {
    vm$3.project_id(project_id);
    var lProject = postgrest$1.loaderWithToken(models.projectDetail.getRowOptions(vm$3.parameters()));
    fetchParallelData(project_id, project_user_id);
    return lProject.load().then(setProject$1(project_user_id));
};

var resetData = function resetData() {
    userDetails({});
    rewardVM.rewards([]);
};

var fetchParallelData = function fetchParallelData(projectId, projectUserId) {
    if (projectUserId) {
        userVM.fetchUser(projectUserId, true, userDetails);
    }

    rewardVM.fetchRewards(projectId);
};

// FIXME: should work with data-parameters that don't have project struct
// just ids: {project_id project_user_id user_id }
var getCurrentProject$1 = function getCurrentProject() {
    var root = document.getElementById('application'),
        data = root && root.getAttribute('data-parameters');

    if (data) {
        var jsonData = JSON.parse(data);

        var projectId = jsonData.projectId,
            projectUserId = jsonData.projectUserId; // legacy

        var project_id = jsonData.project_id,
            project_user_id = jsonData.project_user_id;

        // fill currentProject when jsonData has id and mode (legacy code)

        if (jsonData.id && jsonData.mode) {
            currentProject$1(jsonData);
        }

        m.redraw(true);

        init(project_id || projectId, project_user_id || projectUserId);

        return currentProject$1();
    }
    return false;
};

var routeToProject = function routeToProject(project, ref) {
    return function () {
        currentProject$1(project);

        resetData();

        m.route(h.buildLink(project.permalink, ref), { project_id: project.project_id, project_user_id: project.project_user_id });

        return false;
    };
};

var setProjectPageTitle = function setProjectPageTitle() {
    if (currentProject$1()) {
        var projectName = currentProject$1().project_name || currentProject$1().name;

        return projectName ? h.setPageTitle(projectName) : Function.prototype;
    }
};

var fetchProject = function fetchProject(projectId) {
    var handlePromise = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
    var customProp = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : currentProject$1;

    idVM$2.id(projectId);

    var lproject = postgrest$1.loaderWithToken(models.projectDetail.getRowOptions(idVM$2.parameters()));

    return !handlePromise ? lproject.load() : lproject.load().then(_$1.compose(customProp, _$1.first));
};

var updateProject = function updateProject(projectId, projectData) {
    return m.request({
        method: 'PUT',
        url: '/projects/' + projectId + '.json',
        data: { project: projectData },
        config: h.setCsrfToken
    });
};

var projectVM = {
    userDetails: userDetails,
    getCurrentProject: getCurrentProject$1,
    projectContributions: projectContributions,
    currentProject: currentProject$1,
    rewardDetails: rewardVM.rewards,
    routeToProject: routeToProject,
    setProjectPageTitle: setProjectPageTitle,
    init: init,
    fetchProject: fetchProject,
    updateProject: updateProject
};

var projectFriends = {
    controller: function controller(args) {
        var project = args.project,
            friendsSample = m.prop([]),
            listVM = postgrest$1.paginationVM(models.contributor, 'user_id.desc', {
            Prefer: 'count=exact'
        }),
            filterVM = postgrest$1.filtersVM({
            project_id: 'eq',
            is_follow: 'eq'
        }).project_id(project.project_id).is_follow(true);

        if (!listVM.collection().length) {
            listVM.firstPage(filterVM.parameters()).then(function () {
                friendsSample(_$1.sample(listVM.collection(), 2));
            });
        }
        return {
            project: project,
            listVM: listVM,
            friendsSample: friendsSample
        };
    },
    view: function view(ctrl, args) {
        var project = ctrl.project,
            friendsCount = ctrl.listVM.collection().length,
            wrapper = args.wrapper || '.friend-backed-card';

        return m(wrapper, [m('.friend-facepile', [_$1.map(ctrl.friendsSample(), function (user) {
            var profile_img = _$1.isEmpty(user.data.profile_img_thumbnail) ? '/assets/catarse_bootstrap/user.jpg' : user.data.profile_img_thumbnail;
            return m('img.user-avatar[src=\'' + profile_img + '\']');
        })]), m('p.fontsize-smallest.friend-namepile.lineheight-tighter', [m('span.fontweight-semibold', _$1.map(ctrl.friendsSample(), function (user) {
            return user.data.name.split(' ')[0];
        }).join(friendsCount > 2 ? ', ' : ' and ')), friendsCount > 2 ? [' and ', m('span.fontweight-semibold', 'more ' + (friendsCount - ctrl.friendsSample().length))] : '', friendsCount > 1 ? ' Supported' : ' Supported'])]);
    }
};

var I18nScope$5 = _$1.partial(h.i18nScope, 'projects.card');
var projectCard = {
    controller: function controller(args) {
        var project = args.project,
            progress = project.progress.toFixed(2),
            remainingTextObj = h.translatedTime(project.remaining_time),
            elapsedTextObj = h.translatedTime(project.elapsed_time),
            type = args.type || 'small';

        var css = function css() {
            var cssClasses = {
                small: {
                    wrapper: '.w-col.w-col-4',
                    innerWrapper: '.card-project.card.u-radius',
                    thumb: '.card-project-thumb',
                    descriptionWrapper: '',
                    description: '.card-project-description.alt',
                    title: '.fontweight-semibold.u-text-center-small-only.lineheight-tight.u-marginbottom-10.fontsize-base',
                    author: '.w-hidden-small.w-hidden-tiny.fontsize-smallest.fontcolor-secondary.u-marginbottom-20',
                    headline: '.w-hidden-small.w-hidden-tiny.fontcolor-secondary.fontsize-smaller',
                    city: '.w-hidden-small.w-hidden-tiny.card-project-author.altt'
                },
                medium: {
                    wrapper: '.w-col.w-col-6',
                    innerWrapper: '.card-project.card.u-radius',
                    thumb: '.card-project-thumb.medium',
                    descriptionWrapper: '',
                    description: '.card-project-description.alt',
                    title: '.fontsize-large.fontweight-semibold.u-marginbottom-10',
                    author: '.w-hidden-small.w-hidden-tiny.fontsize-smallest.fontcolor-secondary.u-marginbottom-20',
                    headline: '.w-hidden-small.w-hidden-tiny.fontcolor-secondary.fontsize-smaller',
                    city: '.w-hidden-small.w-hidden-tiny.card-project-author.altt'
                },
                big: {
                    wrapper: '.card.u-radius.card-project',
                    innerWrapper: '.w-row',
                    thumb: '.w-col.w-col-8.w-col-medium-6.card-project-thumb.big',
                    descriptionWrapper: '.w-col.w-col-4.w-col-medium-6',
                    description: '.card-project-description.big',
                    title: '.fontsize-large.fontweight-semibold.u-marginbottom-10',
                    author: '.fontsize-smallest.fontcolor-secondary.u-marginbottom-20',
                    headline: '.fontcolor-secondary.fontsize-smaller',
                    city: '.w-hidden'
                }
            };

            return cssClasses[type];
        };

        var cardMeter = function cardMeter() {
            var failed = function failed() {
                return project.state === 'failed' || project.state === 'waiting_funds' ? 'card-secondary' : '';
            };

            return '.card-project-meter.' + project.mode + '.' + project.state + '.' + (progress > 100 ? 'complete' : 'incomplete') + '.' + failed();
        };

        var isFinished = function isFinished(project) {
            return _$1.contains(['successful', 'failed', 'waiting_funds'], project.state);
        };

        var cardCopy = function cardCopy(project) {
            if (project.expires_at) {
                return isFinished(project) ? [m('.fontsize-smaller.fontweight-loose', 'Closed'), m('.fontsize-smallest.lineheight-tightest', h.momentify(project.zone_expires_at))] : [m('.fontsize-smaller.fontweight-semibold', remainingTextObj.total + ' ' + remainingTextObj.unit), m('.fontsize-smallest.lineheight-tightest', remainingTextObj.total > 1 ? 'Remaining' : 'Remaining')];
            }
            return [m('.fontsize-smallest.lineheight-tight', ['Started', m('br'), elapsedTextObj.total + ' ' + elapsedTextObj.unit])];
        };

        return {
            cardCopy: cardCopy,
            css: css,
            type: type,
            progress: progress,
            remainingTextObj: remainingTextObj,
            elapsedTextObj: elapsedTextObj,
            isFinished: isFinished,
            cardMeter: cardMeter
        };
    },
    view: function view(ctrl, args) {
        var project = args.project,
            projectOwnerName = project.user ? project.user.public_name || project.user.name : project.owner_public_name || project.owner_name,
            projectAddress = project.address ? ' ' + project.address.city + ' - ' + project.address.state_acronym : ' ' + project.city_name + ' - ' + project.state_acronym;

        return m(ctrl.css().wrapper, [m(ctrl.css().innerWrapper, [m('a' + ctrl.css().thumb + '[href="/' + project.permalink + '?ref=' + args.ref + '"]', {
            onclick: projectVM.routeToProject(project, args.ref),
            style: {
                'background-image': 'url(' + (project.project_img || project.large_image) + ')',
                display: 'block'
            }
        }), m(ctrl.css().descriptionWrapper, [m(ctrl.css().description, [m(ctrl.css().title, [m('a.link-hidden[href="/' + project.permalink + '?ref=' + args.ref + '"]', {
            onclick: projectVM.routeToProject(project, args.ref)
        }, project.project_name || project.name)]), m(ctrl.css().author, I18n$1.t('by', I18nScope$5()) + ' ' + projectOwnerName), m(ctrl.css().headline, [m('a.link-hidden[href="/' + project.permalink + '?ref=' + args.ref + '"]', {
            onclick: projectVM.routeToProject(project, args.ref)
        }, project.headline)])]), m(ctrl.css().city, [m('.fontsize-smallest.fontcolor-secondary', [m('span.fa.fa-map-marker.fa-1', ' '), projectAddress])]), m(ctrl.cardMeter(), [ctrl.isFinished(project) ? m('div', project.state === 'successful' && ctrl.progress < 100 ? I18n$1.t('display_status.flex_successful', I18nScope$5()) : I18n$1.t('display_status.' + project.state, I18nScope$5())) : m('.meter', [m('.meter-fill', {
            style: {
                width: (ctrl.progress > 100 ? 100 : ctrl.progress) + '%'
            }
        })])]), m('.card-project-stats', [m('.w-row', [m('.w-col.w-col-4.w-col-small-4.w-col-tiny-4', [m('.fontsize-base.fontweight-semibold', Math.floor(project.progress) + '%')]), m('.w-col.w-col-4.w-col-small-4.w-col-tiny-4.u-text-center-small-only', [m('.fontsize-smaller.fontweight-semibold', 'Rs ' + h.formatNumber(project.pledged)), m('.fontsize-smallest.lineheight-tightest', I18n$1.t('contributed', I18nScope$5()))]), m('.w-col.w-col-4.w-col-small-4.w-col-tiny-4.u-text-right', ctrl.cardCopy(project))])])]), args.showFriends && ctrl.type === 'big' ? m('.w-col.w-col-4.w-col-medium-6', [m.component(projectFriends, { project: project })]) : '']), args.showFriends && ctrl.type !== 'big' ? m.component(projectFriends, { project: project }) : '']);
    }
};

var I18nScope$4 = _$1.partial(h.i18nScope, 'projects');

var projectRow = {
    view: function view(ctrl, args) {
        var collection = args.collection,
            title = args.title || collection.title,
            ref = args.ref,
            showFriends = args.showFriends,
            wrapper = args.wrapper || '.w-section.section.u-marginbottom-40';

        if (collection.loader() || collection.collection().length > 0) {
            return m(wrapper, [m('.w-container', [!_$1.isUndefined(collection.title) || !_$1.isUndefined(collection.hash) ? m('.w-row.u-marginbottom-30', [m(showFriends ? '.w-col.w-col-8.w-col-small-6.w-col-tiny-6' : '.w-col.w-col-10.w-col-small-6.w-col-tiny-6', [m('.fontsize-large.lineheight-looser', title)]), m(showFriends ? '.w-col.w-col-4.w-col-small-6.w-col-tiny-6' : '.w-col.w-col-2.w-col-small-6.w-col-tiny-6', [m('.w-row', [showFriends ? m('.w-col.w-col-6', [m('a.btn.btn-no-border.btn-small.btn-terciary[href="/connect-facebook?ref=' + ref + '"]', 'Meet friends')]) : '', m(showFriends ? '.w-col.w-col-6' : '.w-col.w-col-12', m('a.btn.btn-small.btn-terciary[href="/explore?ref=' + ref + '&filter=' + collection.hash + '"]', {
                config: m.route
            }, I18n$1.t('home.see_all', I18nScope$4())))])])]) : '', collection.loader() ? h.loader() : m('.w-row', _$1.map(collection.collection(), function (project) {
                return m.component(projectCard, {
                    project: project,
                    ref: ref,
                    showFriends: showFriends
                });
            }))])]);
        }
        return m('div');
    }
};

/**
 * window.c.landingQA component
 * A visual component that displays a question/answer box with toggle
 *
 * Example:
 * view: () => {
 *      ...
 *      m.component(c.landingQA, {
 *          question: 'Whats your name?',
 *          answer: 'Darth Vader.'
 *      })
 *      ...
 *  }
 */
var landingQA = {
    controller: function controller(args) {
        return {
            showAnswer: h.toggleProp(false, true)
        };
    },
    view: function view(ctrl, args) {
        return m('.card.qa-card.u-marginbottom-20.u-radius.btn-terciary', [m('.fontsize-base', {
            onclick: function onclick() {
                ctrl.showAnswer.toggle();
                args.onclick && args.onclick();
            }
        }, args.question), ctrl.showAnswer() ? m('p.u-margintop-20.fontsize-small', m.trust(args.answer)) : '']);
    }
};

var Flex = {
    controller: function controller() {
        var stats = m.prop([]),
            projects = m.prop([]),
            l = m.prop(),
            sample3 = _.partial(_.sample, _, 3),
            builder = {
            customAction: 'http://fazum.catarse.me/obrigado-landing-catarse-flex'
        },
            addDisqus = function addDisqus(el, isInitialized) {
            if (!isInitialized) {
                h.discuss('http://grasruts.com/flex', 'flex_page');
            }
        },
            flexVM = postgrest$1.filtersVM({
            mode: 'eq',
            state: 'eq',
            recommended: 'eq'
        }),
            statsLoader = postgrest$1.loaderWithToken(models.statistic.getRowOptions());

        flexVM.mode('flex').state('online').recommended(true);

        var projectsLoader = postgrest$1.loader(models.project.getPageOptions(flexVM.parameters()));

        statsLoader.load().then(stats);

        projectsLoader.load().then(_.compose(projects, sample3));

        return {
            addDisqus: addDisqus,
            builder: builder,
            statsLoader: statsLoader,
            stats: stats,
            projectsLoader: projectsLoader,
            projects: {
                loader: projectsLoader,
                collection: projects
            }
        };
    },
    view: function view(ctrl, args) {
        var stats = _.first(ctrl.stats());

        return [m('.w-section.hero-full.hero-zelo', [m('.w-container.u-text-center', [m('img.logo-flex-home[src=\'/assets/logo-flex.png\'][width=\'359\']'), m('.w-row', [m('.w-col.fontsize-large.u-marginbottom-60.w-col-push-2.w-col-8', 'Let`s build a new mode of crowdfunding! Register your email and learn how to register your project on flex!')]), m('.w-row', [m('.w-col.w-col-2'), m.component(landingSignup, {
            builder: ctrl.builder
        }), m('.w-col.w-col-2')])])]), [m('.section', [m('.w-container', [m('.fontsize-largest.u-margintop-40.u-text-center', 'Pra quem será?'), m('.fontsize-base.u-text-center.u-marginbottom-60', 'We will start the testing phase with specific project categories'), m('div', [m('.w-row.u-marginbottom-60', [m('.w-col.w-col-6', [m('.u-text-center.u-marginbottom-20', [m('img[src=\'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/560e393a01b66e250aca67cb_icon-zelo-com.png\'][width=\'210\']'), m('.fontsize-largest.lineheight-loose', 'Causes')]), m('p.fontsize-base', 'Flexibility for causes of impact! We will be open to campaigns of organizations or individuals for the collection of resources for personal causes, assistance campaigns, health, humanitarian aid, animal protection, socio-environmental entrepreneurship, activism or anything that unites people to do good.')]), m('.w-col.w-col-6', [m('.u-text-center.u-marginbottom-20', [m('img[src=\'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/560e3929a0daea230a5f12cd_icon-zelo-pessoal.png\'][width=\'210\']'), m('.fontsize-largest.lineheight-loose', 'Kitties')]), m('p.fontsize-base', 'Simple campaigns that need the flexibility to raise money with people close to you. We will be open to a variety of personal campaigns that can range from covering study costs to helping those in need of medical treatment. To collect the money to make that party buy presents for someone with the help of the galley.')])])])])]), m('.w-section.section.bg-greenlime.fontcolor-negative', [m('.w-container', [m('.fontsize-largest.u-margintop-40.u-marginbottom-60.u-text-center', 'Como funcionará?'), m('.w-row.u-marginbottom-40', [m('.w-col.w-col-6', [m('.u-text-center', [m('img[src=\'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/560e39c578b284493e2a428a_zelo-money.png\'][width=\'180\']')]), m('.fontsize-large.u-marginbottom-10.u-text-center.fontweight-semibold', 'Stay with how much to collect'), m('p.u-text-center.fontsize-base', 'Flex is to drive campaigns where all money is welcome! You get everything you can raise.')]), m('.w-col.w-col-6', [m('.u-text-center', [m('img[src=\'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/560e39d37c013d4a3ee687d2_icon-reward.png\'][width=\'180\']')]), m('.fontsize-large.u-marginbottom-10.u-text-center.fontweight-semibold', 'No rewards required'), m('p.u-text-center.fontsize-base', 'No flex offering rewards is optional. You choose whether to offer them makes sense for your project and campaign.')])]), m('.w-row.u-marginbottom-40', [m('.w-col.w-col-6', [m('.u-text-center', [m('img[src=\'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/560e39fb01b66e250aca67e3_icon-curad.png\'][width=\'180\']')]), m('.fontsize-large.u-marginbottom-10.u-text-center.fontweight-semibold', 'You publish your project yourself'), m('p.u-text-center.fontsize-base', 'All campaigns enrolled in the flex come on the air. Agility and ease for you to capture resources through the internet.')]), m('.w-col.w-col-6', [m('.u-text-center', [m('img[src=\'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/560e39e77c013d4a3ee687d4_icon-time.png\'][width=\'180\']')]), m('.fontsize-large.u-marginbottom-10.u-text-center.fontweight-semibold', 'End the campaign anytime'), m('p.u-text-center.fontsize-base', 'There is no capitation time limit. You choose when to close your campaign and receive the amounts collected.')])])])]), m('.w-section.section', [m('.w-container', [m('.w-editable.fontsize-larger.u-margintop-40.u-margin-bottom-40.u-text-center', 'Meet some of the first flex campaigns'), ctrl.projectsLoader() ? h.loader() : m.component(projectRow, { collection: ctrl.projects, ref: 'ctrse_flex', wrapper: '.w-row.u-margintop-40' })])]), m('.w-section.divider'), m('.w-section.section', [m('.w-container', [m('.fontsize-larger.u-text-center.u-marginbottom-60.u-margintop-40', 'Doubts'), m('.w-row.u-marginbottom-60', [m('.w-col.w-col-6', [m.component(landingQA, {
            question: 'What are the flexible mode fees? ',
            answer: 'Like in Grasruts, sending a project costs nothing! The fee charged on the Grasruts flex service is 13% on the amount collected.'
        }), m.component(landingQA, {
            question: 'Where does the money from my project come from?',
            answer: 'Family, friends, fans and members of communities that you are part of are your greatest contributors. It is they who will spread their campaign to the people they know, and so the circle of supporters is increasing and your campaign is gaining strength.'
        }), m.component(landingQA, {
            question: 'What is the difference between the flexible and the "all or nothing"?',
            answer: 'Currently Grasruts uses only the "all or nothing" model, where you only get the money if you beat the collection goal within the term of the campaign. The flexible model is different because it allows the director to keep what he has collected, regardless of whether or not he reaches the project goal within the term of the campaign. There will be no time limit for campaigns. Our flexible system will be something new compared to the models that currently exist in the market.'
        })]), m('.w-col.w-col-6', [m.component(landingQA, {
            question: 'Can I enter campaigns for flexible mode already?',
            answer: 'Yes. Register your email and learn how to register your project on flex!'
        }), m.component(landingQA, {
            question: 'Why do you want to do the Grasruts flex?',
            answer: 'We believe that the Brazilian crowdfunding environment still has room for many actions, tests and experiments to really understand what people need. We dream of making collective financing a habit in Brazil. Grasruts flex is another step in this direction.'
        }), m.component(landingQA, {
            question: 'When will you launch Grasruts flex?',
            answer: 'We still do not know when we will open flex for the general public, but you can register your email on this page and receive special material on how to submit your project.'
        })])])])]), m('.w-section.section-large.u-text-center.bg-purple', [m('.w-container.fontcolor-negative', [m('.fontsize-largest', 'Inscreva seu projeto!'), m('.fontsize-base.u-marginbottom-60', 'Register your email and learn how to register your project on flex!'), m('.w-row', [m('.w-col.w-col-2'), m.component(landingSignup, {
            builder: ctrl.builder
        }), m('.w-col.w-col-2')])])]), m('.w-section.section-one-column.bg-catarse-zelo.section-large[style="min-height: 50vh;"]', [m('.w-container.u-text-center', [m('.w-editable.u-marginbottom-40.fontsize-larger.lineheight-tight.fontcolor-negative', 'Flex is an experiment and initiative of Grasruts, Nepal`s largest crowdfunding platform.'), m('.w-row.u-text-center', ctrl.statsLoader() ? h.loader() : [m('.w-col.w-col-4', [m('.fontsize-jumbo.text-success.lineheight-loose', h.formatNumber(stats.total_contributors, 0, 3)), m('p.start-stats.fontsize-base.fontcolor-negative', 'People have already supported at least 01 project in Grasruts')]), m('.w-col.w-col-4', [m('.fontsize-jumbo.text-success.lineheight-loose', h.formatNumber(stats.total_projects_success, 0, 3)), m('p.start-stats.fontsize-base.fontcolor-negative', 'Projects have already been funded in Grasruts')]), m('.w-col.w-col-4', [m('.fontsize-jumbo.text-success.lineheight-loose', stats.total_contributed.toString().slice(0, 2) + ' millions'), m('p.start-stats.fontsize-base.fontcolor-negative', 'They were invested in ideas published in Grasruts')])])])]), m('.w-section.section.bg-blue-one.fontcolor-negative', [m('.w-container', [m('.fontsize-large.u-text-center.u-marginbottom-20', 'Recommend the Grasruts flex for friends! '), m('.w-row', [m('.w-col.w-col-2'), m('.w-col.w-col-8', [m('.w-row', [m('.w-col.w-col-6.w-col-small-6.w-col-tiny-6.w-sub-col-middle', [m('div', [m('img.icon-share-mobile[src=\'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/53a3f66e05eb6144171d8edb_facebook-xxl.png\']'), m('a.w-button.btn.btn-large.btn-fb[href="http://www.facebook.com/sharer/sharer.php?u=http://www.grasruts.com/flex?ref=facebook&title=' + encodeURIComponent('Meet the new Grasruts Flex!') + '"][target="_blank"]', 'eeee')])]), m('.w-col.w-col-6.w-col-small-6.w-col-tiny-6', [m('div', [m('img.icon-share-mobile[src=\'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/53a3f65105eb6144171d8eda_twitter-256.png\']'), m('a.w-button.btn.btn-large.btn-tweet[href="https://twitter.com/intent/tweet?text=' + encodeURIComponent('Let`s build a new mode of crowdfunding for Grasruts! Join us, sign up for your email!') + 'http://www.grasruts.com/flex?ref=twitter"][target="_blank"]', 'To tweet')])])])]), m('.w-col.w-col-2')])])]), m('.w-section.section-large.bg-greenlime', [m('.w-container', [m('#participe-do-debate.u-text-center', { config: h.toAnchor() }, [m('h1.fontsize-largest.fontcolor-negative', 'Build Flex with us'), m('.fontsize-base.u-marginbottom-60.fontcolor-negative', 'Start a conversation, ask, comment, critique and make suggestions!')]), m('#disqus_thread.card.u-radius[style="min-height: 50vh;"]', {
            config: ctrl.addDisqus
        })])])]];
    }
};

/**
 * window.c.Tooltip component
 * A component that allows you to show a tooltip on
 * a specified element hover. It receives the element you want
 * to trigger the tooltip and also the text to display as tooltip.
 *
 * Example of use:
 * view: () => {
 *     let tooltip = (el) => {
 *          return m.component(c.Tooltip, {
 *              el: el,
 *              text: 'text to tooltip',
 *              width: 300
 *          })
 *     }
 *
 *     return tooltip('a#link-wth-tooltip[href="#"]');
 *
 * }
 */
var tooltip = {
    controller: function controller(args) {
        var parentHeight = m.prop(0),
            width = m.prop(args.width || 280),
            top = m.prop(0),
            left = m.prop(0),
            opacity = m.prop(0),
            parentOffset = m.prop({ top: 0, left: 0 }),
            tooltip = h.toggleProp(0, 1),
            toggle = function toggle() {
            tooltip.toggle();
            m.redraw();
        };

        var setParentPosition = function setParentPosition(el, isInitialized) {
            if (!isInitialized) {
                parentOffset(h.cumulativeOffset(el));
            }
        },
            setPosition = function setPosition(el, isInitialized) {
            if (!isInitialized) {
                var elTop = el.offsetHeight + el.offsetParent.offsetHeight;
                var style = window.getComputedStyle(el);

                if (window.innerWidth < el.offsetWidth + 2 * parseFloat(style.paddingLeft) + 30) {
                    // 30 here is a safe margin
                    el.style.width = window.innerWidth - 30; // Adding the safe margin
                    left(-parentOffset().left + 15); // positioning center of window, considering margin
                } else if (parentOffset().left + el.offsetWidth / 2 <= window.innerWidth && parentOffset().left - el.offsetWidth / 2 >= 0) {
                    left(-el.offsetWidth / 2); // Positioning to the center
                } else if (parentOffset().left + el.offsetWidth / 2 > window.innerWidth) {
                    left(-el.offsetWidth + el.offsetParent.offsetWidth); // Positioning to the left
                } else if (parentOffset().left - el.offsetWidth / 2 < 0) {
                    left(-el.offsetParent.offsetWidth); // Positioning to the right
                }
                top(-elTop); // Setting top position
            }
        };

        return {
            width: width,
            top: top,
            left: left,
            opacity: opacity,
            tooltip: tooltip,
            toggle: toggle,
            setPosition: setPosition,
            setParentPosition: setParentPosition
        };
    },
    view: function view(ctrl, args) {
        var width = ctrl.width();
        return m(args.el, {
            onclick: ctrl.toggle,
            config: ctrl.setParentPosition,
            style: { cursor: 'pointer' }
        }, ctrl.tooltip() ? [m('.tooltip.dark[style="width: ' + width + 'px; top: ' + ctrl.top() + 'px; left: ' + ctrl.left() + 'px;"]', {
            config: ctrl.setPosition
        }, [m('.fontsize-smallest', args.text)])] : '');
    }
};

var railsErrors = m.prop('');
var setRailsErrors = function setRailsErrors(errors) {
    return railsErrors(errors);
};
var errorGroups = {
    basics: ['public_name', 'permalink', 'category_id', 'city', 'public_tags', 'name'],
    goal: ['goal', 'online_days'],
    description: ['about_html'],
    budget: ['budget'],
    announce_expiration: ['online_days'],
    card: ['uploaded_image', 'headline'],
    video: ['video_url'],
    reward: ['rewards.size', 'rewards.minimum_value', 'rewards.title', 'rewards.description', 'rewards.deliver_at', 'rewards.shipping_fees.value', 'rewards.shipping_fees.destination'],
    user_about: ['user.uploaded_image', 'user.public_name', 'user.about_html'],
    user_settings: ['bank_account.id', 'bank_account.user_id', 'bank_account.account', 'bank_account.agency', 'bank_account.owner_name', 'bank_account.owner_document', 'bank_account.created_at', 'bank_account.updated_at', 'bank_account.account_digit', 'bank_account.agency_digit', 'bank_account.bank_id', 'bank_account.account_type', 'user.name', 'user.cpf', 'user.birth_date', 'user.country_id', 'user.address_state', 'user.address_street', 'user.address_number', 'user.address_city', 'user.address_neighbourhood', 'bank_account']
};
var errorsFor = function errorsFor(group) {
    var parsedErrors = void 0;
    try {
        parsedErrors = JSON.parse(railsErrors());
    } catch (err) {
        parsedErrors = {};
    }
    if (_$1.find(errorGroups[group], function (key) {
        return parsedErrors.hasOwnProperty(key);
    })) {
        return m('span.fa.fa-exclamation-circle.fa-fw.fa-lg.text-error');
    }
    if (_$1.isEmpty(parsedErrors)) {
        return '';
    }
    return m('span.fa.fa-check-circle.fa-fw.fa-lg.text-success');
};

var mapRailsErrors = function mapRailsErrors(rails_errors, errorsFields, e) {
    var parsedErrors = void 0;
    try {
        parsedErrors = JSON.parse(rails_errors);
    } catch (err) {
        parsedErrors = {};
    }
    var extractAndSetErrorMsg = function extractAndSetErrorMsg(label, fieldArray) {
        var value = _$1.first(_$1.compact(_$1.map(fieldArray, function (field) {
            return _$1.first(parsedErrors[field]);
        })));

        if (value) {
            e(label, value);
            e.inlineError(label, true);
        }
    };

    _$1.each(errorsFields, function (item, i) {
        extractAndSetErrorMsg(item[0], item[1]);
    });
};

// @FIXME: fix places where we call this
var validatePublish = function validatePublish() {
    var currentProject = h.getCurrentProject();
    if (_$1.isEmpty(railsErrors())) {
        return false;
    }
    m.request({
        method: 'GET',
        url: '/projects/' + currentProject.project_id + '/validate_publish',
        config: h.setCsrfToken
    }).then(function () {
        setRailsErrors('');
    }).catch(function (err) {
        if (err) {
            setRailsErrors(err.errors_json);
        }
        m.redraw();
    });
    return false;
};

var railsErrorsVM = {
    errorsFor: errorsFor,
    validatePublish: validatePublish,
    railsErrors: railsErrors,
    setRailsErrors: setRailsErrors,
    mapRailsErrors: mapRailsErrors
};

/**
 * window.c.ProjectDashboardMenu component
 * build dashboard project menu for project owners
 * and admin.
 *
 * Example:
 * m.component(c.ProjectDashboardMenu, {
 *     project: projectDetail Object,
 * })
 */
var I18nScope$7 = _$1.partial(h.i18nScope, 'projects.dashboard_nav');
var linksScope = _$1.partial(h.i18nScope, 'projects.dashboard_nav_links');

var projectDashboardMenu = {
    controller: function controller(args) {
        var body = document.getElementsByTagName('body')[0],
            editLinksToggle = h.toggleProp(true, false),
            validating = m.prop(false),
            showPublish = h.toggleProp(true, false),
            bodyToggleForNav = h.toggleProp('body-project open', 'body-project closed'),
            validatePublish = function validatePublish() {
            validating(true);
            m.redraw();
            m.request({
                method: 'GET',
                url: '/projects/' + args.project().project_id + '/validate_publish',
                config: h.setCsrfToken
            }).then(function () {
                validating(false);
                window.location.href = '/projects/' + args.project().project_id + '/publish';
                m.redraw();
            }).catch(function (err) {
                validating(false);
                railsErrorsVM.setRailsErrors(err.errors_json);
                m.redraw();
            });
        },
            projectThumb = function projectThumb(project) {
            if (_$1.isEmpty(project.large_image)) {
                if (_$1.isEmpty(project.thumb_image)) {
                    return '/assets/thumb-project.png';
                }
                return project.thumb_image;
            }
            return project.large_image;
        };

        if (args.project().is_published) {
            editLinksToggle.toggle(false);
        }

        if (args.hidePublish) {
            showPublish.toggle(false);
        }

        return {
            body: body,
            validating: validating,
            validatePublish: validatePublish,
            editLinksToggle: editLinksToggle,
            showPublish: showPublish,
            bodyToggleForNav: bodyToggleForNav,
            projectThumb: projectThumb
        };
    },
    view: function view(ctrl, args) {
        var project = args.project(),
            projectRoute = '/projects/' + project.project_id,
            editRoute = projectRoute + '/edit',
            editLinkClass = function editLinkClass(hash) {
            return 'dashboard-nav-link-left ' + (project.is_published ? 'indent' : '') + ' ' + (h.hashMatch(hash) ? 'selected' : '');
        };
        var optionalOpt = m('span.fontsize-smallest.fontcolor-secondary', ' (optional)');

        ctrl.body.className = ctrl.bodyToggleForNav();

        return m('#project-nav', [m('.project-nav-wrapper', [m('nav.w-section.dashboard-nav.side', [m('a#dashboard_preview_link.w-inline-block.dashboard-project-name[href="' + (project.is_published ? '/' + project.permalink : editRoute + '#preview') + '"]', [m('img.thumb-project-dashboard[src="' + (project ? ctrl.projectThumb(project) : '/assets/thumb-project.png') + '"][width="114"]'), m('.fontcolor-negative.lineheight-tight.fontsize-small', project.name), m('img.u-margintop-10[src="/assets/catarse_bootstrap/badge-' + project.mode + '-h.png"][width=80]')]), m('#info-links', [m('a#dashboard_home_link[class="dashboard-nav-link-left ' + (h.locationActionMatch('insights') ? 'selected' : '') + '"][href="' + projectRoute + '/insights"]', [m('span.fa.fa-bar-chart.fa-lg.fa-fw'), I18n$1.t('start_tab', I18nScope$7())]), project.is_published ? [m('a#dashboard_reports_link[class="dashboard-nav-link-left ' + (h.locationActionMatch('contributions_report') ? 'selected' : '') + '"][href="' + projectRoute + '/contributions_report"]', [m('span.fa.fa.fa-table.fa-lg.fa-fw'), I18n$1.t('reports_tab', I18nScope$7())]), m('a#dashboard_reports_link[class="dashboard-nav-link-left ' + (h.locationActionMatch('posts') ? 'selected' : '') + '"][href="' + projectRoute + '/posts"]', [m('span.fa.fa-bullhorn.fa-fw.fa-lg'), I18n$1.t('posts_tab', I18nScope$7()), project.posts_count > 0 ? m('span.badge', project.posts_count) : m('span.badge.badge-attention', 'None')])] : '']), m('.edit-project-div', [!project.is_published ? '' : m('button#toggle-edit-menu.dashboard-nav-link-left', {
            onclick: ctrl.editLinksToggle.toggle
        }, [m('span.fa.fa-pencil.fa-fw.fa-lg'), I18n$1.t('edit_project', I18nScope$7())]), ctrl.editLinksToggle() ? m('#edit-menu-items', [m('#dashboard-links', [!project.is_published || project.is_admin_role ? [m('a#basics_link[class="' + editLinkClass('#basics') + '"][href="' + editRoute + '#basics"]', railsErrorsVM.errorsFor('basics'), I18n$1.t('basics_tab', linksScope())), m('a#goal_link[class="' + editLinkClass('#goal') + '"][href="' + editRoute + '#goal"]', railsErrorsVM.errorsFor('goal'), I18n$1.t('goal_tab', linksScope()))] : '', m('a#description_link[class="' + editLinkClass('#description') + '"][href="' + editRoute + '#description"]', railsErrorsVM.errorsFor('description'), I18n$1.t('description_tab', linksScope())), m('a#video_link[class="' + editLinkClass('#video') + '"][href="' + editRoute + '#video"]', [railsErrorsVM.errorsFor('video'), 'Video', m('span.fontsize-smallest.fontcolor-secondary', ' (optinal)')]), m('a#budget_link[class="' + editLinkClass('#budget') + '"][href="' + editRoute + '#budget"]', railsErrorsVM.errorsFor('budget'), I18n$1.t('budget_tab', linksScope())), m('a#card_link[class="' + editLinkClass('#card') + '"][href="' + editRoute + '#card"]', railsErrorsVM.errorsFor('card'), I18n$1.t('card_tab', linksScope())), m('a#dashboard_reward_link[class="' + editLinkClass('#reward') + '"][href="' + editRoute + '#reward"]', [railsErrorsVM.errorsFor('reward'), 'Rewards', optionalOpt]), m('a#dashboard_user_about_link[class="' + editLinkClass('#user_about') + '"][href="' + editRoute + '#user_about"]', railsErrorsVM.errorsFor('user_about'), I18n$1.t('about_you_tab', linksScope())), project.is_published || project.state === 'draft' || project.is_admin_role ? [m('a#dashboard_user_settings_link[class="' + editLinkClass('#user_settings') + '"][href="' + editRoute + '#user_settings"]', railsErrorsVM.errorsFor('user_settings'), I18n$1.t('account_tab', linksScope()))] : '', !project.is_published ? [m('a#dashboard_preview_link[class="' + editLinkClass('#preview') + '"][href="' + editRoute + '#preview"]', [m('span.fa.fa-fw.fa-eye.fa-lg'), I18n$1.t('preview_tab', linksScope())])] : ''])]) : '', !project.is_published && ctrl.showPublish() ? [ctrl.validating() ? h.loader() : m('.btn-send-draft-fixed', project.mode === 'aon' ? [project.state === 'draft' ? m('button.btn.btn-medium', {
            onclick: ctrl.validatePublish
        }, [I18n$1.t('publish', I18nScope$7()), m.trust('&nbsp;&nbsp;'), m('span.fa.fa-chevron-right')]) : ''] : [project.state === 'draft' ? m('button.btn.btn-medium', {
            onclick: ctrl.validatePublish
        }, [I18n$1.t('publish', I18nScope$7()), m.trust('&nbsp;&nbsp;'), m('span.fa.fa-chevron-right')]) : ''])] : [project.mode === 'flex' && project.is_published ? [m('.btn-send-draft-fixed', _$1.isNull(project.expires_at) ? m('a.w-button.btn.btn-medium.btn-secondary-dark[href="' + editRoute + '#announce_expiration"]', I18n$1.t('announce_expiration', I18nScope$7())) : '')] : '']])])]), m('a.btn-dashboard href="javascript:void(0);"', {
            onclick: ctrl.bodyToggleForNav.toggle
        }, [m('span.fa.fa-bars.fa-lg')])]);
    }
};

/**
 * window.c.AdminProjectDetailsCard component
 * render an box with some project statistics info
 *
 * Example:
 * m.component(c.AdminProjectDetailsCard, {
 *     resource: projectDetail Object,
 * })
 */
var adminProjectDetailsCard = {
    controller: function controller(args) {
        var project = args.resource,
            isFinalLap = function isFinalLap() {
            return (
                // @TODO: use 8 days because timezone on js
                !_.isNull(project.expires_at) && moment().add(8, 'days') >= moment(project.zone_expires_at)
            );
        };
        return {
            project: project,
            remainingTextObj: h.translatedTime(project.remaining_time),
            elapsedTextObj: h.translatedTime(project.elapsed_time),
            isFinalLap: isFinalLap
        };
    },
    view: function view(ctrl) {
        var project = ctrl.project,
            progress = project.progress.toFixed(2),
            statusTextObj = h.projectStateTextClass(project.state),
            remainingTextObj = ctrl.remainingTextObj,
            elapsedTextObj = ctrl.elapsedTextObj;

        return m('.project-details-card.card.u-radius.card-terciary.u-marginbottom-20', [m('div', [m('.fontsize-small.fontweight-semibold', [m('span.fontcolor-secondary', 'Status:'), ' ', m('span', {
            class: statusTextObj.cssClass
        }, ctrl.isFinalLap() && project.open_for_contributions ? 'FINAL STRAIGHT' : statusTextObj.text), ' ']), project.is_published ? [m('.meter.u-margintop-20.u-marginbottom-10', [m('.meter-fill', {
            style: {
                width: (progress > 100 ? 100 : progress) + '%'
            }
        })]), m('.w-row', [m('.w-col.w-col-3.w-col-small-3.w-col-tiny-6', [m('.fontcolor-secondary.lineheight-tighter.fontsize-small', 'Financed'), m('.fontweight-semibold.fontsize-large.lineheight-tight', progress + '%')]), m('.w-col.w-col-3.w-col-small-3.w-col-tiny-6', [m('.fontcolor-secondary.lineheight-tighter.fontsize-small', 'Raised'), m('.fontweight-semibold.fontsize-large.lineheight-tight', ['Rs ' + h.formatNumber(project.pledged, 2)])]), m('.w-col.w-col-3.w-col-small-3.w-col-tiny-6', [m('.fontcolor-secondary.lineheight-tighter.fontsize-small', 'Supports'), m('.fontweight-semibold.fontsize-large.lineheight-tight', project.total_contributions)]), m('.w-col.w-col-3.w-col-small-3.w-col-tiny-6', [_.isNull(project.expires_at) ? [m('.fontcolor-secondary.lineheight-tighter.fontsize-small', 'Initiated'), m('.fontweight-semibold.fontsize-large.lineheight-tight', elapsedTextObj.total + ' ' + elapsedTextObj.unit)] : [m('.fontcolor-secondary.lineheight-tighter.fontsize-small', 'Remain'), m('.fontweight-semibold.fontsize-large.lineheight-tight', remainingTextObj.total + ' ' + remainingTextObj.unit)]])])] : ''])]);
    }
};

/**
 * window.c.OnlineSuccessModalContent component
 * Render online success message
 *
 */
var onlineSuccessModalContent = {
    view: function view(ctrl, args) {
        return m('.modal-dialog-content.u-text-center', [m('.fa.fa-check-circle.fa-5x.text-success.u-marginbottom-40'), m('p.fontsize-larger.lineheight-tight', 'Your campaign is online !!! Congratulations on that first big step. Good luck on this journey. ;)')]);
    }
};

/**
 * window.c.ProjectDataStats component
 * render a row with project stats info like:
 * state / total_contributions / total_pledged / elapsed | remaning time
 *
 * Example:
 * m.component(c.ProjectDataStats, {project: project})
 **/
var projectDataStats = {
    view: function view(ctrl, args) {
        var project = args.project(),
            visitorsTotal = args.visitorsTotal(),
            statusTextObj = h.projectStateTextClass(project.state),
            remainingTextObj = h.translatedTime(project.remaining_time),
            elapsedTextObj = h.translatedTime(project.elapsed_time);

        return m('', [m('.w-row.u-marginbottom-60.u-margintop-30.u-text-center', [m('.w-col.w-col-2'), m('.w-col.w-col-4', [m('.fontsize-large', [m('span.fontcolor-secondary', 'Status: '), m('span', { class: statusTextObj.cssClass }, statusTextObj.text)])]), m('.w-col.w-col-4', [m('.fontsize-large.fontweight-semibold', [m('span.fa.fa-clock-o'), _$1.isNull(project.expires_at) ? ' Started ' + elapsedTextObj.total + ' ' + elapsedTextObj.unit : ' ' + remainingTextObj.total + ' ' + remainingTextObj.unit + ' ' + (remainingTextObj.total > 1 ? 'remaining' : 'remaining')])]), m('.w-col.w-col-2')]), m('.card.medium.u-marginbottom-60.u-radius.u-text-center', { style: { 'white-space': 'nowrap' } }, [m('.w-row', [m('.w-col.w-col-6', [m('.w-row.u-marginbottom-30.u-margintop-30', [m('.w-col.w-col-4.w-col-small-4.w-col-tiny-4', [m('.fontsize-larger.fontweight-semibold', '' + visitorsTotal), 'Visitors']), m('.w-col.w-col-4.w-col-small-4.w-col-tiny-4', [m('.bg-triangle-funnel.fontcolor-secondary.fontsize-base', h.formatNumber(project.total_contributors / visitorsTotal * 100 || 0, 2) + '%')]), m('.w-col.w-col-4.w-col-small-4.w-col-tiny-4', [m('.fontsize-larger.fontweight-semibold', '' + project.total_contributors), 'Supporters'])])]), m('.w-col.w-col-6', [m('.w-row.u-marginbottom-30.u-margintop-30', [m('.w-col.w-col-9.w-col-small-6.w-col-tiny-6', [m('.fontsize-larger.fontweight-semibold', 'Rs ' + h.formatNumber(project.pledged, 2)), 'Collected']), m('.w-col.w-col-3.w-col-small-6.w-col-tiny-6', [m('.fontsize-larger.fontweight-semibold', h.formatNumber(project.progress, 2) + '%'), 'From Meta'])])])]), m('.fontcolor-secondary.fontsize-smallest.u-margintop-20', ['Data may take up to 12 hours to update.',
        // m('a.alt-link', {href:"http://suporte.catarse.me/hc/pt-br/articles/214764343#visitante", target:"_blank"}, 'know more'),
        '.'])])]);
    }
};

/**
 * window.c.deleteProjectModalContent component
 * Render delete project modal
 *
 */
var deleteProjectModalContent = {
    controller: function controller(args) {
        var l = m.prop(false);
        var deleteSuccess = m.prop(false),
            confirmed = m.prop(true),
            error = m.prop(''),
            check = m.prop('');

        var deleteProject = function deleteProject() {
            if (check() === 'Delete-draft') {
                var loaderOpts = models.deleteProject.postOptions({
                    _project_id: args.project.project_id
                });
                l = postgrest$1.loaderWithToken(loaderOpts);
                l.load().then(function () {
                    deleteSuccess(true);
                }).catch(function (err) {
                    confirmed(false);
                    error('Error deleting campaign. Please try again.');
                    m.redraw();
                });
            } else {
                confirmed(false);
                error('Please correct the following errors: To permanently delete the campaign you must fill in "Delete-draft".');
            }
            return false;
        };

        return {
            deleteProject: deleteProject,
            confirmed: confirmed,
            deleteSuccess: deleteSuccess,
            error: error,
            check: check
        };
    },
    view: function view(ctrl, args) {
        return m('div', ctrl.deleteSuccess() ? '' : m('.modal-dialog-header', m('.fontsize-large.u-text-center', ['Confirm ', m('span.fa.fa-trash', '')])), m('form.modal-dialog-content', { onsubmit: ctrl.deleteProject }, ctrl.deleteSuccess() ? [m('.fontsize-base.u-margintop-30', 'Project deleted successfully. Click the link below to return to the homepage.'), m('a.btn.btn-inactive.btn-large.u-margintop-30[href=\'/en/users/' + h.getUser().user_id + '/edit#projects\']', 'Resume')] : [m('.fontsize-base.u-marginbottom-60', ['The campaign will be permanently deleted and all data you filled in the draft edition will not be retrieved.']), m('.fontsize-base.u-marginbottom-10', ['Confirm writing ', 'in the field below ', m('span.fontweight-semibold.text-error', 'Delete-draft')]), m('.w-form', m('.text-error.u-marginbottom-10', ctrl.error()), [m('div', m('input.positive.text-field.u-marginbottom-40.w-input[maxlength=\'256\'][type=\'text\']', { class: ctrl.confirmed() ? false : 'error', placeholder: 'Delete-draft', onchange: m.withAttr('value', ctrl.check) }))]), m('div', m('.w-row', [m('.w-col.w-col-3'), m('.u-text-center.w-col.w-col-6', [m('input.btn.btn-inactive.btn-large.u-marginbottom-20[type=\'submit\'][value=\'Delete Permanently\']'), m('a.fontsize-small.link-hidden-light[href=\'#\']', { onclick: args.displayDeleteModal.toggle }, 'Cancel')]), m('.w-col.w-col-3')]))]));
    }
};

/**
 * window.c.projectDeleteButton component
 * A button showing modal to delete draft project
 */
var projectDeleteButton = {
    controller: function controller(args) {
        var displayDeleteModal = h.toggleProp(false, true);
        return {
            displayDeleteModal: displayDeleteModal
        };
    },
    view: function view(ctrl, args) {
        return m('div', [ctrl.displayDeleteModal() ? m.component(modalBox, {
            displayModal: ctrl.displayDeleteModal,
            hideCloseButton: true,
            content: [deleteProjectModalContent, { displayDeleteModal: ctrl.displayDeleteModal, project: args.project }]
        }) : '', m('.before-footer', m('.w-container', m('a.btn.btn-inline.btn-no-border.btn-small.btn-terciary.u-marginbottom-20.u-right.w-button[href=\'javascript:void(0);\']', { onclick: ctrl.displayDeleteModal.toggle, style: { transition: 'all 0.5s ease 0s' } }, [m.trust('&nbsp;'), 'Delete Campaign ', m('span.fa.fa-trash', '')])))]);
    }
};

/**
 * window.c.cancelProjectModalContent component
 * Render cancel project modal
 *
 */
var cancelProjectModalContent = {
    controller: function controller(args) {
        var checkError = m.prop(false),
            check = m.prop(''),
            showNextModal = function showNextModal() {
            if (check() === 'cancel-campaign') {
                args.displayModal.toggle();
                document.getElementById('send-message').style.display = 'block';
            } else {
                checkError(true);
            }
            return false;
        };

        return {
            showNextModal: showNextModal,
            checkError: checkError,
            check: check
        };
    },
    view: function view(ctrl, args) {
        return m('form.cancel-project-modal.modal-dialog-content', { onsubmit: ctrl.showNextModal }, [m('.fontsize-small.u-marginbottom-20', ['Upon cancellation, your campaign will appear on the platform as "non-funded" and your supporters will be immediately reimbursed. ', m('span.fontweight-semibold', 'This action can not be undone!'), m('br'), m('span.fontweight-semibold')]), m('.fontsize-small.u-marginbottom-10', ['If you are sure you want to cancel your campaign, please confirm by writing ', m('span.fontweight-semibold.text-error', 'cancel-campaign '), 'in the field below. Then we will ask you to write a message to your supporters and your campaign will then be canceled.', m('span.fontweight-semibold.text-error')]), m('.w-form', [m('input.positive.text-field.u-marginbottom-40.w-input[maxlength=\'256\'][type=\'text\']', { class: !ctrl.checkError() ? false : 'error', placeholder: 'cancel-campaign', onchange: m.withAttr('value', ctrl.check) })]), m('div', m('.w-row', [m('.w-col.w-col-3'), m('.u-text-center.w-col.w-col-6', [m('input.btn.btn-inactive.btn-large.u-marginbottom-20[type=\'submit\'][value=\'Next step >\']'), m('a.fontsize-small.link-hidden-light[href=\'#\']', { onclick: args.displayModal.toggle }, 'Cancel')]), m('.w-col.w-col-3')]))]);
    }
};

/**
 * window.c.projectCancelButton component
 * A button showing modal to cancel online project
 */
var projectCancelButton = {
    controller: function controller(args) {
        var displayCancelModal = h.toggleProp(false, true);
        return {
            displayCancelModal: displayCancelModal
        };
    },
    view: function view(ctrl, args) {
        return m('div', [ctrl.displayCancelModal() ? m.component(modalBox, {
            displayModal: ctrl.displayCancelModal,
            content: [cancelProjectModalContent, { displayModal: ctrl.displayCancelModal }]
        }) : '', m('.w-row.before-footer', m('.w-col.w-col-12', m('.w-container', m('button.btn.btn-cancel.btn-inline.btn-no-border.btn-small.btn-terciary.u-marginbottom-20.u-right.w-button', { onclick: ctrl.displayCancelModal.toggle, style: { transition: 'all 0.5s ease 0s' } }, [m('span.fa.fa-times-circle', ''), m.trust('&nbsp;'), 'Cancel Project']))))]);
    }
};

/**
 * window.c.ProjectDataChart component
 * A graph builder interface to be used on project related dashboards.
 * Example:
 * m.component(c.ProjectDataChart, {
 *     collection: ctrl.contributionsPerDay,
 *     label: 'R$ arrecadados por dia',
 *     dataKey: 'total_amount'
 * })
 */
var projectDataChart = {
    controller: function controller(args) {
        var resource = _$1.first(args.collection()),
            source = !_$1.isUndefined(resource) ? resource.source : [],
            mountDataset = function mountDataset() {
            return [{
                fillColor: 'rgba(126,194,69,0.2)',
                strokeColor: 'rgba(126,194,69,1)',
                pointColor: 'rgba(126,194,69,1)',
                pointStrokeColor: '#fff',
                pointHighlightFill: '#fff',
                pointHighlightStroke: 'rgba(220,220,220,1)',
                data: _$1.map(source, function (item) {
                    return item[args.dataKey];
                })
            }];
        },
            renderChart = function renderChart(element, isInitialized) {
            if (!isInitialized) {
                var ctx = element.getContext('2d');

                new Chart(ctx).Line({
                    labels: args.xAxis ? _$1.map(source, function (item) {
                        return args.xAxis(item);
                    }) : [],
                    datasets: mountDataset()
                });
            }
        };

        return {
            renderChart: renderChart,
            source: source
        };
    },
    view: function view(ctrl, args) {
        return m('.card.u-radius.medium.u-marginbottom-30', [m('.fontweight-semibold.u-marginbottom-10.fontsize-large.u-text-center', args.label), m('.w-row', [m('.w-col.w-col-12.overflow-auto', [!_$1.isEmpty(ctrl.source) ? m('canvas[id="chart"][width="860"][height="300"]', {
            config: ctrl.renderChart
        }) : m('.w-col.w-col-8.w-col-push-2', m('p.fontsize-base', args.emptyState))])])]);
    }
};

/**
 * window.c.ProjectDataTable component
 * A table interface constructor that should be used on project related dashboards.
 * It takes an array and a lable as it's sources.
 * The first item in the array is the header descriptor and the rest of them are row data.
 * Rows may return a string or an array and this value will be used as a row output.
 * All table rows are sortable by default. If you want to use a custom value as sort parameter
 * you may set a 2D array as row. In this case, the first array value will be the custom value
 * while the other will be the actual output.
 * Example:
 * m.component(c.ProjectDataTable, {
 *      label: 'Table label',
 *      table: [
 *          ['col header 1', 'col header 2'],
 *          ['value 1x1', [3, 'value 1x2']],
 *          ['value 2x1', [1, 'value 2x2']] //We are using a custom comparator two col 2 values
 *      ],
 *      //Allows you to set a specific column to be ordered by default.
 *      //If no value is set, the first row will be the default one to be ordered.
 *      //Negative values mean that the order should be reverted
 *      defaultSortIndex: -3
 *  })
 */
var projectDataTable = {
    controller: function controller(args) {
        var table = m.prop(args.table),
            sortIndex = m.prop(-1);

        var comparator = function comparator(a, b) {
            var idx = sortIndex(),

            // Check if a custom comparator is used => Read component description
            x = _$1.isArray(a[idx]) && a[idx].length > 1 ? a[idx][0] : a[idx],
                y = _$1.isArray(b[idx]) && b[idx].length > 1 ? b[idx][0] : b[idx];

            if (x < y) {
                return -1;
            }
            if (y < x) {
                return 1;
            }
            return 0;
        };

        var sortTable = function sortTable(idx) {
            var header = _$1.first(table()),
                body = void 0;
            if (sortIndex() === idx) {
                body = _$1.rest(table()).reverse();
            } else {
                sortIndex(idx);
                body = _$1.rest(table()).sort(comparator);
            }

            table(_$1.union([header], body));
        };

        sortTable(Math.abs(args.defaultSortIndex) || 0);

        if (args.defaultSortIndex < 0) {
            sortTable(Math.abs(args.defaultSortIndex) || 0);
        }

        return {
            table: table,
            sortTable: sortTable
        };
    },
    view: function view(ctrl, args) {
        var header = _$1.first(ctrl.table()),
            body = _$1.rest(ctrl.table());
        return m('.table-outer.u-marginbottom-60', [m('.w-row.table-row.fontweight-semibold.fontsize-smaller.header', _$1.map(header, function (heading, idx) {
            var sort = function sort() {
                return ctrl.sortTable(idx);
            };
            return m('.w-col.w-col-4.w-col-small-4.w-col-tiny-4.table-col', [m('a.link-hidden[href="javascript:void(0);"]', {
                onclick: sort
            }, [heading + ' ', m('span.fa.fa-sort')])]);
        })), m('.table-inner.fontsize-small', _$1.map(body, function (rowData) {
            return m('.w-row.table-row', _$1.map(rowData, function (row) {
                // Check if a custom comparator is used => Read component description
                row = _$1.isArray(row) && row.length > 1 ? row[1] : row;
                return m('.w-col.w-col-4.w-col-small-4.w-col-tiny-4.table-col', [m('div', row)]);
            }));
        }))]);
    }
};

var projectReminderCount = {
    view: function view(ctrl, args) {
        var project = args.resource;
        return m('#project-reminder-count.card.u-radius.u-text-center.medium.u-marginbottom-80', [m('.fontsize-large.fontweight-semibold', 'Total people who clicked on the Remember me button'), m('.fontsize-smaller.u-marginbottom-30', 'An email reminder is sent 48 hours before the end of your campaign'), m('.fontsize-jumbo', project.reminder_count)]);
    }
};

/**
 * window.c.ProjectSuccessfulOnboardConfirmAccountAccept component
 * render confirmation message to accept bank data
 *
 * Example:
 * m.component(c.ProjectSuccessfulOnboardConfirmAccountAccept, {
 *    projectAccount: projectAccount,
 *    changeToAction: ctrl.changeToAction //provided by ProjectSuccessfulOnboardConfirmAccount controller
 * })
 **/
var I18nScope$10 = _$1.partial(h.i18nScope, 'projects.successful_onboard.confirm_account');

/**
 * window.c.ProjectSuccessfulOnboardConfirmAccount component
 * render project account data to confirm or redirect when error
 *
 * Example:
 * m.component(c.ProjectSuccessfulOnboardConfirmAccount, {projectAccount: projectAccount})
 **/
var I18nScope$9 = _$1.partial(h.i18nScope, 'projects.successful_onboard.confirm_account');

/**
 * window.c.SuccessfulProjectTaxModal component
 * Modal content for show project transfer complete values data
 */
var successfulProjectTaxModal = {
    view: function view(ctrl, args) {
        var pt = args.projectTransfer;

        return m('div', [m('.modal-dialog-header', [m('.fontsize-large.u-text-center', 'Project Extract')]), m('.modal-dialog-content', [m('p.fontsize-small.u-marginbottom-40', ['Check the extract of your project, including the fees and retentions. If you have questions about how this calculation is done, ', m('a.alt-link[href="http://suporte.catarse.me/hc/pt-br/articles/202037493-FINANCIADO-Como-ser%C3%A1-feito-o-repasse-do-dinheiro-"][target="__blank"]', 'Access here'), '.']), m('div', [m('.w-row.fontsize-small.u-marginbottom-10', [m('.w-col.w-col-4', [m('.text-success', '+\xA0Rs ' + h.formatNumber(pt.pledged, 2))]), m('.w-col.w-col-8', [m('div', 'Total collection (' + pt.total_contributions + ' Supports)')])]), pt.irrf_tax > 0 ? m('.w-row.fontsize-small.u-marginbottom-10', [m('.w-col.w-col-4', [m('.text-success', '+ Rs ' + h.formatNumber(pt.irrf_tax, 2))]), m('.w-col.w-col-8', [m('div', 'Retention IRRF (Income Tax withholding)')])]) : '', m('.w-row.fontsize-small.u-marginbottom-10', [m('.w-col.w-col-4', [m('.text-error', '- Rs ' + h.formatNumber(pt.catarse_fee, 2))]), m('.w-col.w-col-8', [m('div', 'Grasruts fee and means of payment (' + h.formatNumber(pt.service_fee * 100, 2) + '%)\xA0')])]), m('.divider.u-marginbottom-10'), m('.w-row.fontsize-base.fontweight-semibold', [m('.w-col.w-col-4', [m('div', 'Rs ' + h.formatNumber(pt.total_amount, 2))]), m('.w-col.w-col-8', [m('div', 'Total to be transferred')])])])])]);
    }
};

var I18nScope$11 = _$1.partial(h.i18nScope, 'projects.successful_onboard');

/**
 * window.c.ProjectSuccessfulOnboard component
 * render first interaction of successful project onboarding
 * used when project is successful and wants to confirm bank data and request transfer
 *
 * Example:
 * m.component(c.ProjectSuccessfulOnboard, {project: project})
 **/
var I18nScope$8 = _.partial(h.i18nScope, 'projects.successful_onboard');

var projectSuccessfulOnboard = {
    controller: function controller(args) {
        var projectIdVM = postgrest$1.filtersVM({ project_id: 'eq' }),
            projectAccounts = m.prop([]),
            projectTransfers = m.prop([]),
            showTaxModal = h.toggleProp(false, true),
            loader = postgrest$1.loaderWithToken,
            listenToReplace = function listenToReplace(element, isInitialized, context) {
            if (isInitialized) return;

            var toRedraw = {
                tax_link: {
                    action: 'onclick',
                    actionSource: function actionSource() {
                        showTaxModal.toggle();
                        m.redraw();
                    }
                }
            };

            _.map(element.children, function (item) {
                var toR = toRedraw[item.getAttribute('id')];

                if (toR) {
                    item[toR.action] = toR.actionSource;
                }
            });
        };

        projectIdVM.project_id(args.project().project_id);

        var lProjectAccount = loader(models.projectAccount.getRowOptions(projectIdVM.parameters()));
        lProjectAccount.load().then(function (data) {
            projectAccounts(data);
        });

        var lProjectTransfer = loader(models.projectTransfer.getRowOptions(projectIdVM.parameters()));
        lProjectTransfer.load().then(projectTransfers);

        return {
            projectAccounts: projectAccounts,
            projectTransfers: projectTransfers,
            lProjectAccount: lProjectAccount,
            lProjectTransfer: lProjectTransfer,
            showTaxModal: showTaxModal,
            listenToReplace: listenToReplace
        };
    },
    view: function view(ctrl, args) {
        var projectAccount = _.first(ctrl.projectAccounts()),
            projectTransfer = _.first(ctrl.projectTransfers()),
            lpa = ctrl.lProjectAccount,
            lpt = ctrl.lProjectTransfer;

        return m('.w-section.section', [ctrl.showTaxModal() ? m.component(modalBox, {
            displayModal: ctrl.showTaxModal,
            content: [successfulProjectTaxModal, {
                projectTransfer: projectTransfer
            }]
        }) : '', !lpa() && !lpt() ? m('.w-container', [m('.w-row.u-marginbottom-40', [m('.w-col.w-col-6.w-col-push-3', [m('.u-text-center', [m('img.u-marginbottom-20', { src: I18n$1.t('start.icon', I18nScope$8()), width: 94 }), m('.fontsize-large.fontweight-semibold.u-marginbottom-20', I18n$1.t('start.title', I18nScope$8())), m('.fontsize-base.u-marginbottom-30', {
            config: ctrl.listenToReplace
        }, m.trust(I18n$1.t('start.text', I18nScope$8({ total_amount: h.formatNumber(projectTransfer.total_amount, 2) })))), m('a.btn.btn-large.btn-inline', { href: '/users/' + args.project().user_id + '/edit#balance' }, I18n$1.t('start.cta', I18nScope$8()))])])])]) : h.loader()]);
    }
};

var facebookButton = {
    controller: function controller(args) {
        var share = function share() {
            if (FB) {
                FB.ui({
                    method: args.messenger ? 'send' : 'share',
                    link: args.url,
                    href: args.url
                });
            }
        };

        return {
            share: share
        };
    },
    view: function view(ctrl, args) {
        var buttonCss = function buttonCss() {
            if (args.mobile) {
                return 'w-hidden-main w-hidden-medium u-marginbottom-20 btn btn-medium btn-fb';
            } else if (args.big) {
                return 'btn btn-fb btn-large u-marginbottom-20 w-button';
            } else if (args.medium) {
                return 'btn ' + (args.messenger ? 'btn-messenger' : 'btn-fb') + ' btn-medium u-marginbottom-20 w-button';
            }
            return 'btn btn-inline btn-medium btn-terciary u-marginright-20';
        };

        return m('button', {
            class: buttonCss(),
            onclick: ctrl.share
        }, [m('span.fa', {
            class: args.messenger ? 'fa-comment' : 'fa-facebook'
        }), args.messenger ? ' Messenger' : ' Facebook']);
    }
};

/**
 * copyTextInput component
 * Displays a text input that copies it's content on click
 *
 * Example of use:
 * view: () => {
 *   ...
 *   m.component(copyTextInput, {value: 'some value'})
 *   ...
 * }
 */
var copyTextInput = {
    controller: function controller(args) {
        var showSuccess = m.prop(false);

        var select = function select(el) {
            var range = void 0,
                selection = void 0;

            if (document.body.createTextRange) {
                range = document.body.createTextRange();
                range.moveToElementText(el);
                range.select();
            } else if (window.getSelection) {
                selection = window.getSelection();
                range = document.createRange();
                range.selectNodeContents(el);
                selection.removeAllRanges();
                selection.addRange(range);
            }
        };

        var setClickHandler = function setClickHandler(el, isInitialized) {
            var copy = void 0;
            if (!isInitialized) {
                (function () {
                    var textarea = el.parentNode.previousSibling.firstChild;

                    textarea.innerText = args.value; //This fixes an issue when instantiating multiple copy clipboard components

                    el.onclick = function () {
                        select(textarea);
                        copy = document.execCommand('copy');
                        if (copy) {
                            showSuccess(true);
                            m.redraw();
                        } else {
                            textarea.blur();
                        }
                        return false;
                    };
                })();
            }
        };

        return {
            setClickHandler: setClickHandler,
            showSuccess: showSuccess
        };
    },
    view: function view(ctrl, args) {
        return m('.clipboard.w-row', [m('.w-col.w-col-10.w-col-small-10.w-col-tiny-10', m('textarea.copy-textarea.text-field.w-input', {
            style: 'margin-bottom:0;'
        }, args.value)), m('.w-col.w-col-2.w-col-small-2.w-col-tiny-2', m('button.btn.btn-medium.btn-no-border.btn-terciary.fa.fa-clipboard.w-button', {
            config: ctrl.setClickHandler
        })), ctrl.showSuccess() ? m.component(popNotification, { message: 'Link copied' }) : '']);
    }
};

var projectInviteCard = {
    view: function view(ctrl, args) {
        var project = args.project;

        return m('.card.card-secondary.u-marginbottom-20.u-radius.w-clearfix', [m('.fontsize-base.fontweight-semibold.u-marginbottom-30.u-text-center', 'Invite your friends to support your campaign'), m('.w-row', [m('.w-sub-col.u-marginbottom-20.w-col.w-col-4', [m.component(facebookButton, { url: h.projectFullPermalink(project) + '?ref=facebook&utm_source=facebook.com&utm_medium=social&utm_campaign=project_share_insights', medium: true })]), m('.w-sub-col.u-marginbottom-20.w-col.w-col-4', [m.component(facebookButton, { messenger: true, url: h.projectFullPermalink(project) + '?ref=facebook&utm_source=facebook.com&utm_medium=messenger&utm_campaign=project_share_insights', medium: true })]), m('.w-col.w-col-4', [m('.w-form', [m('form[data-name=\'Email Form 2\'][id=\'email-form-2\'][name=\'email-form-2\']', [m.component(copyTextInput, { value: h.projectFullPermalink(project) + '?ref=project_link' })])])])])]);
    }
};

var I18nScope$6 = _$1.partial(h.i18nScope, 'projects.insights');

var insights = {
    controller: function controller(args) {
        var filtersVM = postgrest$1.filtersVM({
            project_id: 'eq'
        }),
            displayModal = h.toggleProp(false, true),
            projectDetails = m.prop([]),
            contributionsPerDay = m.prop([]),
            visitorsTotal = m.prop(0),
            visitorsPerDay = m.prop([]),
            loader = postgrest$1.loaderWithToken,
            setProjectId = function setProjectId() {
            try {
                var project_id = m.route.param('project_id');

                filtersVM.project_id(project_id);
            } catch (e) {
                filtersVM.project_id(args.root.getAttribute('data-id'));
            }
        };

        if (h.paramByName('online_success') === 'true') {
            displayModal.toggle();
        }

        setProjectId();

        var l = loader(models.projectDetail.getRowOptions(filtersVM.parameters()));
        l.load().then(projectDetails);

        var processVisitors = function processVisitors(data) {
            if (!_$1.isEmpty(data)) {
                visitorsPerDay(data);
                visitorsTotal(_$1.first(data).total);
            }
        };

        var lVisitorsPerDay = loader(models.projectVisitorsPerDay.getRowOptions(filtersVM.parameters()));
        lVisitorsPerDay.load().then(processVisitors);

        var lContributionsPerDay = loader(models.projectContributionsPerDay.getRowOptions(filtersVM.parameters()));
        lContributionsPerDay.load().then(contributionsPerDay);

        var contributionsPerLocationTable = [['state', 'Support', 'Rs Supported (% Of total)']];
        var buildPerLocationTable = function buildPerLocationTable(contributions) {
            return !_$1.isEmpty(contributions) ? _$1.map(_$1.first(contributions).source, function (contribution) {
                var column = [];

                column.push(contribution.state_acronym || 'Outro/other');
                column.push(contribution.total_contributions);
                column.push([contribution.total_contributed, [// Adding row with custom comparator => read project-data-table description
                m('input[type="hidden"][value="' + contribution.total_contributed + '"'), 'Rs ', h.formatNumber(contribution.total_contributed, 2, 3), m('span.w-hidden-small.w-hidden-tiny', ' (' + contribution.total_on_percentage.toFixed(2) + '%)')]]);
                return contributionsPerLocationTable.push(column);
            }) : [];
        };

        var lContributionsPerLocation = loader(models.projectContributionsPerLocation.getRowOptions(filtersVM.parameters()));
        lContributionsPerLocation.load().then(buildPerLocationTable);

        var contributionsPerRefTable = [[I18n$1.t('ref_table.header.origin', I18nScope$6()), I18n$1.t('ref_table.header.contributions', I18nScope$6()), I18n$1.t('ref_table.header.amount', I18nScope$6())]];
        var buildPerRefTable = function buildPerRefTable(contributions) {
            return !_$1.isEmpty(contributions) ? _$1.map(_$1.first(contributions).source, function (contribution) {
                // Test if the string matches a word starting with ctrse_ and followed by any non-digit group of characters
                // This allows to remove any versioned referral (i.e.: ctrse_newsletter_123) while still getting ctrse_test_ref
                var re = /(ctrse_[\D]*)/,
                    test = re.exec(contribution.referral_link);

                var column = [];

                if (test) {
                    // Removes last underscore if it exists
                    contribution.referral_link = test[0].substr(-1) === '_' ? test[0].substr(0, test[0].length - 1) : test[0];
                }

                column.push(contribution.referral_link ? I18n$1.t('referral.' + contribution.referral_link, I18nScope$6({ defaultValue: contribution.referral_link })) : I18n$1.t('referral.others', I18nScope$6()));
                column.push(contribution.total);
                column.push([contribution.total_amount, [m('input[type="hidden"][value="' + contribution.total_contributed + '"'), 'Rs ', h.formatNumber(contribution.total_amount, 2, 3), m('span.w-hidden-small.w-hidden-tiny', ' (' + contribution.total_on_percentage.toFixed(2) + '%)')]]);
                return contributionsPerRefTable.push(column);
            }) : [];
        };

        var lContributionsPerRef = loader(models.projectContributionsPerRef.getRowOptions(filtersVM.parameters()));
        lContributionsPerRef.load().then(buildPerRefTable);

        return {
            l: l,
            lContributionsPerRef: lContributionsPerRef,
            lContributionsPerLocation: lContributionsPerLocation,
            lContributionsPerDay: lContributionsPerDay,
            lVisitorsPerDay: lVisitorsPerDay,
            displayModal: displayModal,
            filtersVM: filtersVM,
            projectDetails: projectDetails,
            contributionsPerDay: contributionsPerDay,
            contributionsPerLocationTable: contributionsPerLocationTable,
            contributionsPerRefTable: contributionsPerRefTable,
            visitorsPerDay: visitorsPerDay,
            visitorsTotal: visitorsTotal
        };
    },
    view: function view(ctrl) {
        var project = _$1.first(ctrl.projectDetails()) || {
            user: {
                name: 'Director'
            }
        },
            buildTooltip = function buildTooltip(el) {
            return m.component(tooltip, {
                el: el,
                text: ['Tell us where the support came from your project. Learn how to use this table and better plan your communication actions ', m('a[href="' + I18n$1.t('ref_table.help_url', I18nScope$6()) + '"][target=\'_blank\']', 'on here.')],
                width: 380
            });
        };

        if (!ctrl.l()) {
            project.user.name = project.user.name || 'Director';
        }

        return m('.project-insights', !ctrl.l() ? [m('.w-section.section-product.' + project.mode), project.is_owner_or_admin ? m.component(projectDashboardMenu, {
            project: m.prop(project)
        }) : '', ctrl.displayModal() ? m.component(modalBox, {
            displayModal: ctrl.displayModal,
            content: [onlineSuccessModalContent]
        }) : '', m('.w-container', project.state === 'successful' ? m.component(projectSuccessfulOnboard, { project: m.prop(project) }) : [m('.w-row.u-marginbottom-40', [m('.w-col.w-col-8.w-col-push-2', [m('.fontweight-semibold.fontsize-larger.lineheight-looser.u-marginbottom-10.u-text-center.dashboard-header', I18n$1.t('campaign_title', I18nScope$6())), project.state === 'online' ? m.component(projectInviteCard, { project: project }) : '', project.state === 'draft' ? m.component(adminProjectDetailsCard, {
            resource: project
        }) : '', m('p.' + project.state + '-project-text.u-text-center.fontsize-small.lineheight-loose', [project.mode === 'flex' && _$1.isNull(project.expires_at) && project.state !== 'draft' ? m('span', [
            // m.trust(I18n.t('finish_explanation', I18nScope())),
            // m('a.alt-link[href="http://suporte.catarse.me/hc/pt-br/articles/213783503-tudo-sobre-Prazo-da-campanha"][target="_blank"]', I18n.t('know_more', I18nScope()))
        ]) : m.trust(I18n$1.t('campaign.' + project.mode + '.' + project.state, I18nScope$6({ username: project.user.name, expires_at: h.momentify(project.zone_expires_at), sent_to_analysis_at: h.momentify(project.sent_to_analysis_at) })))])])])]), project.state === 'draft' ? m.component(projectDeleteButton, { project: project }) : '', project.is_published ? [m('.divider'), m('.w-section.section-one-column.section.bg-gray.before-footer', [m('.w-container', [m.component(projectDataStats, { project: m.prop(project), visitorsTotal: ctrl.visitorsTotal }), m('.w-row', [m('.w-col.w-col-12.u-text-center', {
            style: {
                'min-height': '300px'
            }
        }, [m('.fontweight-semibold.u-marginbottom-10.fontsize-large.u-text-center', [I18n$1.t('visitors_per_day_label', I18nScope$6())]), !ctrl.lVisitorsPerDay() ? m.component(projectDataChart, {
            collection: ctrl.visitorsPerDay,
            dataKey: 'visitors',
            xAxis: function xAxis(item) {
                return h.momentify(item.day);
            },
            emptyState: I18n$1.t('visitors_per_day_empty', I18nScope$6())
        }) : h.loader()])]), m('.w-row', [m('.w-col.w-col-12.u-text-center', {
            style: {
                'min-height': '300px'
            }
        }, [!ctrl.lContributionsPerDay() ? m.component(projectDataChart, {
            collection: ctrl.contributionsPerDay,
            label: I18n$1.t('amount_per_day_label', I18nScope$6()),
            dataKey: 'total_amount',
            xAxis: function xAxis(item) {
                return h.momentify(item.paid_at);
            },
            emptyState: I18n$1.t('amount_per_day_empty', I18nScope$6())
        }) : h.loader()])]), m('.w-row', [m('.w-col.w-col-12.u-text-center', {
            style: {
                'min-height': '300px'
            }
        }, [!ctrl.lContributionsPerDay() ? m.component(projectDataChart, {
            collection: ctrl.contributionsPerDay,
            label: I18n$1.t('contributions_per_day_label', I18nScope$6()),
            dataKey: 'total',
            xAxis: function xAxis(item) {
                return h.momentify(item.paid_at);
            },
            emptyState: I18n$1.t('contributions_per_day_empty', I18nScope$6())
        }) : h.loader()])]), m('.w-row', [m('.w-col.w-col-12.u-text-center', [m('.project-contributions-per-ref', [m('.fontweight-semibold.u-marginbottom-10.fontsize-large.u-text-center', [I18n$1.t('ref_origin_title', I18nScope$6()), ' ', buildTooltip('span.fontsize-smallest.tooltip-wrapper.fa.fa-question-circle.fontcolor-secondary')]), !ctrl.lContributionsPerRef() ? !_$1.isEmpty(_$1.rest(ctrl.contributionsPerRefTable)) ? m.component(projectDataTable, {
            table: ctrl.contributionsPerRefTable,
            defaultSortIndex: -2
        }) : m('.card.u-radius.medium.u-marginbottom-60', m('.w-row.u-text-center.u-margintop-40.u-marginbottom-40', m('.w-col.w-col-8.w-col-push-2', m('p.fontsize-base', I18n$1.t('contributions_per_ref_empty', I18nScope$6()))))) : h.loader()])])]),
        // m('.w-row', [
        //     m('.w-col.w-col-12.u-text-center', [
        //         m('.project-contributions-per-ref', [
        //             m('.fontweight-semibold.u-marginbottom-10.fontsize-large.u-text-center', I18n.t('location_origin_title', I18nScope())),
        //             !ctrl.lContributionsPerLocation() ? !_.isEmpty(_.rest(ctrl.contributionsPerLocationTable)) ? m.component(projectDataTable, {
        //                 table: ctrl.contributionsPerLocationTable,
        //                 defaultSortIndex: -2
        //             }) : m('.card.u-radius.medium.u-marginbottom-60',
        //                     m('.w-row.u-text-center.u-margintop-40.u-marginbottom-40',
        //                         m('.w-col.w-col-8.w-col-push-2',
        //                             m('p.fontsize-base', I18n.t('contributions_per_location_empty', I18nScope()))
        //                         )
        //                     )
        //                 ) : h.loader()
        //         ])
        //     ]),
        // ]),
        m('.w-row', [m('.w-col.w-col-12.u-text-center', [m.component(projectReminderCount, {
            resource: project
        })])])])]), project.state === 'online' && (project.is_admin_role || project.pledged == 0) ? m.component(projectCancelButton, { project: project }) : ''] : ''] : h.loader());
    }
};

var postsPreview = {
    controller: function controller(args) {
        var togglePreview = function togglePreview() {
            h.scrollTop();
            args.showPreview(false);
        },
            sendNotification = function sendNotification(e) {
            e.preventDefault();

            var notificationData = {
                title: args.title(),
                comment_html: args.comment_html(),
                reward_id: args.reward_id >= 1 ? args.reward_id : null,
                recipients: args.reward_id >= 1 ? 'reward' : args.reward_id == '-1' ? 'public' : 'backers'
            };

            return m.request({
                method: 'POST',
                url: '/projects/' + args.project_id + '/posts.json',
                data: {
                    project_post: notificationData,
                    project: args.project_id
                },
                config: h.setCsrfToken
            }).then(function () {
                args.showSuccess(true);
                args.comment_html('');
                args.title('');
                togglePreview();
                m.redraw();
            }).catch(function (err) {
                args.errors('Error sending message.'), args.showError(true);
                m.redraw();
            });
        };
        return {
            sendNotification: sendNotification,
            togglePreview: togglePreview
        };
    },
    view: function view(ctrl, args) {
        var comment_html = args.comment_html(),
            title = args.title(),
            recipientsText = args.reward_id > 1 ? m('.fontsize-small.u-marginbottom-30', ['The news above will be sent by email to the ', m('span.fontweight-semibold', args.rewardText), ' And it will stay ', m('span.fontweight-semibold', 'Visible on the platform only for these supporters.')]) : args.reward_id === '-1' ? m('.fontsize-small.u-marginbottom-30', ['The news above will be  ', m('span.fontweight-semibold', 'sent by email to everyone'), ' and will be ', m('span.fontweight-semibold', 'publicly visible '), 'on the platform.']) : m('.fontsize-small.u-marginbottom-30', [m('span', ' The news above will be  '), m('span.fontweight-semibold', 'sent by email to all supporters'), m('span', ' and it will stay '), m('span.fontweight-semibold', 'visible only to those on the platform.')]);

        return m('div', [m('.dashboard-header.u-text-center', m('.w-container', m('.w-row', [m('.w-col.w-col-3'), m('.w-col.w-col-6', m('.fontsize-larger.fontweight-semibold.lineheight-tight', 'Review your news before submitting!')), m('.w-col.w-col-3')]))), m('.section', [m('.w-container', m('.card.u-marginbottom-60.u-radius.w-row', [m('.w-col.w-col-1'), m('.u-marginbottom-30.u-margintop-30.w-col.w-col-10.w-hidden-small.w-hidden-tiny', [m('.fontcolor-secondary.fontsize-small.u-text-center', '16/01/2017'), m('.fontsize-larger.fontweight-semibold.u-marginbottom-30.u-text-center', title), m('.fontsize-base', m.trust(comment_html))]), m('.w-col.w-col-1')])), m('.w-row', [m('.w-col.w-col-3'), m('.w-col.w-col-6', recipientsText), m('.w-col.w-col-3')]), m('.u-marginbottom-20.w-row', [m('.w-col.w-col-3'), m('._w-sub-col.w-col.w-col-4', m('button.btn.btn-large', {
            onclick: ctrl.sendNotification
        }, [m('span.fa.fa-paper-plane', ''), ' ', m.trust('&nbsp;'), 'Send'])), m('.w-col.w-col-2', m('button.btn.btn-large.btn-terciary', {
            onclick: ctrl.togglePreview
        }, 'Edit')), m('.w-col.w-col-3')])])]);
    }
};

var posts = {
    controller: function controller(args) {
        var deleteFormSubmit = void 0;
        var showPreview = m.prop(false),
            showSuccess = m.prop(false),
            showError = m.prop(false),
            titleHasError = m.prop(false),
            commentHasError = m.prop(false),
            projectPosts = m.prop(),
            loader = postgrest$1.loaderWithToken,
            errors = m.prop(''),
            fields = {
            title: m.prop(''),
            comment_html: m.prop(''),
            reward_id: m.prop('-1')
        },
            filterVM = postgrest$1.filtersVM({
            project_id: 'eq'
        }),
            validateTitle = function validateTitle() {
            var title = String(fields.title());
            if (title.length === 0) {
                titleHasError(true);
            }

            return !titleHasError();
        },
            validateComment = function validateComment() {
            var comment = String(fields.comment_html());
            if (comment.length === 0) {
                commentHasError(true);
            }

            return !commentHasError();
        },
            togglePreview = function togglePreview() {
            if (!validateTitle()) {
                errors('Title can not be empty');
                showError(true);
            } else if (!validateComment()) {
                errors('Message can not be left blank.');
                showError(true);
            } else {
                h.scrollTop();
                showPreview(true);
            }
            return false;
        },
            project_id = args.project_id,
            projectDetails = m.prop([]),
            rewardText = function rewardText(rewardId) {
            var reward = _$1.find(rewardVM.rewards(), function (r) {
                return String(r.id) === String(rewardId);
            });
            return 'Reward supporters Rs' + reward.minimum_value + ' - ' + (reward.title ? reward.title : reward.description.substring(0, 70) + '...');
        },
            showRecipientes = function showRecipientes(post) {
            if (post.recipients === 'public') {
                return 'Everyone (supporters and non-supporters)';
            } else if (post.recipients === 'backers') {
                return 'All supporters';
            }
            var reward = _$1.find(rewardVM.rewards(), function (r) {
                return r.id === post.reward_id;
            });
            if (reward) {
                return rewardText(reward.id);
            }
            return '...';
        },
            toDeletePost = m.prop(-1),
            deletePost = function deletePost(post) {
            return function () {
                toDeletePost(post.id);
                m.redraw(true);
                deleteFormSubmit();
                return false;
            };
        },
            setPostDeletionForm = function setPostDeletionForm(el, isInit) {
            if (!isInit) {
                deleteFormSubmit = function deleteFormSubmit() {
                    return el.submit();
                };
            }
        },
            openedPercentage = function openedPercentage(post) {
            return Math.floor(post.open_count / post.delivered_count * 100) || 0;
        };

        models.projectPostDetail.pageSize(false);
        filterVM.project_id(project_id);
        var listVM = postgrest$1.loaderWithToken(models.projectPostDetail.getPageOptions(_$1.extend(filterVM.parameters(), { order: 'created_at.desc' }))),
            l = loader(models.projectDetail.getRowOptions(filterVM.parameters()));

        listVM.load().then(projectPosts);

        rewardVM.fetchRewards(project_id);

        l.load().then(projectDetails);

        return {
            listVM: listVM,
            l: l,
            projectPosts: projectPosts,
            showRecipientes: showRecipientes,
            fields: fields,
            showPreview: showPreview,
            togglePreview: togglePreview,
            project_id: project_id,
            deletePost: deletePost,
            rewardText: rewardText,
            errors: errors,
            showSuccess: showSuccess,
            titleHasError: titleHasError,
            commentHasError: commentHasError,
            showError: showError,
            setPostDeletionForm: setPostDeletionForm,
            toDeletePost: toDeletePost,
            projectDetails: projectDetails,
            openedPercentage: openedPercentage
        };
    },
    view: function view(ctrl) {
        var project = _$1.first(ctrl.projectDetails()),
            paidRewards = _$1.filter(rewardVM.rewards(), function (reward) {
            return reward.paid_count > 0;
        });

        return project ? m('.project-posts', project.is_owner_or_admin ? m.component(projectDashboardMenu, {
            project: m.prop(project)
        }) : '', ctrl.showPreview() ? m.component(postsPreview, {
            showError: ctrl.showError,
            showSuccess: ctrl.showSuccess,
            errors: ctrl.errors,
            showPreview: ctrl.showPreview,
            project_id: ctrl.project_id,
            comment_html: ctrl.fields.comment_html,
            title: ctrl.fields.title,
            reward_id: ctrl.fields.reward_id(),
            rewardText: ctrl.fields.reward_id() >= 1 ? ctrl.rewardText(ctrl.fields.reward_id()) : null
        }) : [m('.w-section.section-product.' + project.mode), ctrl.showSuccess() ? m.component(popNotification, {
            message: 'Message sent successfully'
        }) : '', ctrl.showError() ? m.component(popNotification, {
            message: ctrl.errors(),
            error: true
        }) : '', m('.dashboard-header.u-text-center', m('.w-container', m('.w-row', [m('.w-col.w-col-3'), m('.w-col.w-col-6', m('.fontsize-larger.fontweight-semibold.lineheight-tight', 'Submit a news story to your supporters')), m('.w-col.w-col-3')]))), m('.section', m('.w-container', m('.w-row', [m('.w-col.w-col-1'), m('.w-col.w-col-10', [
        // m('.u-marginbottom-60.u-text-center',
        //     m('._w-inline-block.card.fontsize-small.u-radius', [
        //         m('span.fa.fa-lightbulb-o',
        //             ''
        //         ),
        //         ' Veja ótimo motivos para ',
        //         m('a.alt-link[href=\'https://catarse.attach.io/B1AHAGm1x\'][target=\'_blank\']',
        //             'falar com seus apoiadores agora mesmo!'
        //         )
        //     ])
        // ),
        m('.card.card-terciary.medium.u-marginbottom-80.w-form', [m('form', [m('label.field-label.fontweight-semibold', 'Recipients'), m('select.positive.text-field.w-select', {
            onchange: m.withAttr('value', ctrl.fields.reward_id)
        }, [m('option[value=\'-1\']', {
            selected: true
        }, 'Everyone (supporters and non-supporters)'), m('option[value=\'0\']', 'All supporters'), _$1.map(paidRewards, function (reward) {
            return m('option[value=\'' + reward.id + '\']', ctrl.rewardText(reward.id));
        })]), m('label.field-label.fontweight-semibold', 'Title'), m('input.positive.text-field.w-input[id=\'post_title\'][maxlength=\'256\'][type=\'text\']', {
            name: 'posts[title]',
            value: ctrl.fields.title(),
            onfocus: function onfocus() {
                return ctrl.titleHasError(false);
            },
            class: ctrl.titleHasError() ? 'error' : '',
            onchange: m.withAttr('value', ctrl.fields.title)
        }), m('label.field-label.fontweight-semibold', 'Text'), m('.preview-container.u-marginbottom-40', {
            class: ctrl.commentHasError() ? 'error' : '',
            onclick: function onclick() {
                return ctrl.commentHasError(false);
            }
        }, h.redactor('posts[comment_html]', ctrl.fields.comment_html)), m('.u-marginbottom-20.w-row', [m('.w-col.w-col-3'), m('._w-sub-col.w-col.w-col-6', m('button.btn.btn-large', {
            onclick: ctrl.togglePreview
        }, 'Preview')), m('.w-col.w-col-3')])])]), m('.fontsize-large.fontweight-semibold.u-marginbottom-40', 'News already sent'), m('.table-outer.u-marginbottom-60', [m('.fontsize-smaller.fontweight-semibold.header.table-row.w-row', [m('.table-col.w-col.w-col-5', m('div', 'Title')), m('.table-col.u-text-center.w-col.w-col-3', m('div', 'Sent')), m('.table-col.u-text-center.w-col.w-col-3', m('div', 'Open')), m('.table-col.w-col.w-col-1')]), ctrl.projectPosts() ? m('.fontsize-small.table-inner', [_$1.map(ctrl.projectPosts(), function (post) {
            return m('.table-row.w-row', [m('.table-col.w-col.w-col-5', [m('a.alt-link.fontsize-base[href=\'/projects/' + project.project_id + '/posts/' + post.id + '#posts\'][target=\'_blank\']', post.title), m('.fontcolor-secondary.fontsize-smallest', [m('span.fontweight-semibold', 'Sent in: '), h.momentify(post.created_at, 'DD/MM/YYYY, h:mm A')]), m('.fontcolor-secondary.fontsize-smallest', [m('span.fontweight-semibold', 'Recipients: '), ctrl.showRecipientes(post)])]), m('.table-col.u-text-center.w-col.w-col-3', m('.fontsize-base', post.delivered_count)), m('.table-col.u-text-center.w-col.w-col-3', m('.fontsize-base', [post.open_count, m('span.fontcolor-secondary', ' (' + ctrl.openedPercentage(post) + '%)')])), m('.table-col.w-col.w-col-1', m('button.btn.btn-no-border.btn-small.btn-terciary.fa.fa-lg.fa-trash', {
                onclick: ctrl.deletePost(post)
            }))]);
        }), m('form.w-hidden', {
            action: '/en/projects/' + project.project_id + '/posts/' + ctrl.toDeletePost(),
            method: 'POST',
            config: ctrl.setPostDeletionForm
        }, [m('input[name=\'utf8\'][type=\'hidden\'][value=\'✓\']'), m('input[name=\'_method\'][type=\'hidden\'][value=\'delete\']'), m('input[name=\'authenticity_token\'][type=\'hidden\'][value=\'' + h.authenticityToken() + '\']')])]) : h.loader()])]), m('.w-col.w-col-1')])))]) : h.loader();
    }
};

var I18nScope$12 = _.partial(h.i18nScope, 'pages.jobs');
var jobs = {
    view: function view(ctrl, args) {
        return m('.page-jobs', [m('.w-section.hero-jobs.hero-medium', [m('.w-containe.u-text-center', [m('img.icon-hero[src="/assets/logo-white.png"]'), m('.u-text-center.u-marginbottom-20.fontsize-largest', I18n$1.t('title', I18nScope$12()))])]), m('.w-section.section', [m('.w-container.u-margintop-40', [m('.w-row', [m('.w-col.w-col-8.w-col-push-2.u-text-center', [m('.fontsize-large.u-marginbottom-30', I18n$1.t('info', I18nScope$12())), m('a[href="/start"].w-button.btn.btn-large.btn-inline', I18n$1.t('cta', I18nScope$12()))])])])])]);
    }
};

var liveStatistics = {
    controller: function controller() {
        var args = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        var pageStatistics = m.prop([]),
            notificationData = m.prop({});

        models.statistic.getRow().then(pageStatistics);
        // args.socket is a socket provided by socket.io
        // can see there https://github.com/catarse/catarse-live/blob/master/public/index.js#L8
        if (args.socket && _$1.isFunction(args.socket.on)) {
            args.socket.on('new_paid_contributions', function (msg) {
                notificationData(JSON.parse(msg.payload));
                models.statistic.getRow().then(pageStatistics);
                m.redraw();
            });
        }

        return {
            pageStatistics: pageStatistics,
            notificationData: notificationData
        };
    },
    view: function view(ctrl) {
        var data = ctrl.notificationData();

        return m('.w-section.bg-stats.section.min-height-100', [m('.w-container.u-text-center', _$1.map(ctrl.pageStatistics(), function (stat) {
            return [m('img.u-marginbottom-60[src="https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/55ada5dd11b36a52616d97df_symbol-catarse.png"]'), m('.fontcolor-negative.u-marginbottom-40', [m('.fontsize-megajumbo.fontweight-semibold', 'Rs ' + h.formatNumber(stat.total_contributed, 2, 3)), m('.fontsize-large', 'Donated to campaigns published here')]), m('.fontcolor-negative.u-marginbottom-60', [m('.fontsize-megajumbo.fontweight-semibold', stat.total_contributors), m('.fontsize-large', 'People have already supported at least 1 campaign in Grasruts')])];
        })), !_$1.isEmpty(data) ? m('.w-container', [m('div', [m('.card.u-radius.u-marginbottom-60.medium', [m('.w-row', [m('.w-col.w-col-4', [m('.w-row', [m('.w-col.w-col-4.w-col-small-4', [m('img.thumb.u-round[src="' + h.useAvatarOrDefault(data.user_image) + '"]')]), m('.w-col.w-col-8.w-col-small-8', [m('.fontsize-large.lineheight-tight', data.user_name)])])]), m('.w-col.w-col-4.u-text-center.fontsize-base.u-margintop-20', [m('div', 'Just supported the')]), m('.w-col.w-col-4', [m('.w-row', [m('.w-col.w-col-4.w-col-small-4', [m('img.thumb-project.u-radius[src="' + data.project_image + '"][width="75"]')]), m('.w-col.w-col-8.w-col-small-8', [m('.fontsize-large.lineheight-tight', data.project_name)])])])])])])]) : '', m('.u-text-center.fontsize-large.u-marginbottom-10.fontcolor-negative', [m('a.link-hidden.fontcolor-negative[href="https://github.com/jvn"][target="_blank"]', [m('span.fa.fa-github', '.'), ' Open Source with pride! '])])]);
    }
};

var I18nScope$13 = _$1.partial(h.i18nScope, 'projects.dashboard_contribution_reports');

var projectContributionReportHeader = {
    view: function view(ctrl, args) {
        var filterBuilder = args.filterBuilder,
            paymentStateFilter = _$1.findWhere(filterBuilder, {
            label: 'payment_state'
        }),
            rewardFilter = _$1.findWhere(filterBuilder, {
            label: 'reward_filter'
        }),
            deliveryFilter = _$1.findWhere(filterBuilder, {
            label: 'delivery_filter'
        }),
            mainFilter = _$1.findWhere(filterBuilder, {
            component: filterMain
        }),
            project_id = args.filterVM.project_id();

        rewardFilter.data.options = args.mapRewardsToOptions();

        return m('.w-section.dashboard-header', m('.w-container', [m('.w-container', m('.w-row', m('.w-col.w-col-8.w-col-push-2.u-marginbottom-30.u-text-center', [m('.fontweight-semibold.fontsize-larger.lineheight-looser', I18n$1.t('title', I18nScope$13())), m('.fontsize-base', I18n$1.t('subtitle_html', I18nScope$13()))]))), m('.w-form', [m('form', {
            onsubmit: args.submit
        }, m('.w-row', [m('.w-col.w-col-8', m('.w-row', [m.component(paymentStateFilter.component, paymentStateFilter.data), m.component(rewardFilter.component, rewardFilter.data), m.component(deliveryFilter.component, deliveryFilter.data)])), m('.w-col.w-col-4', m('.u-margintop-20.w-row', [m.component(mainFilter.component, mainFilter.data)]))]))])]));
    }
};

var projectContributionReportContentCard = {
    controller: function controller(args) {
        var project = args.project(),
            checked = function checked(contribution) {
            return _$1.contains(args.selectedContributions(), contribution.id);
        },
            selectContribution = function selectContribution(contribution) {
            var anyChecked = $$1('input:checkbox').is(':checked');

            args.selectedAny(anyChecked);
            if (!checked(contribution)) {
                args.selectedContributions().push(contribution.id);
            } else {
                args.selectedContributions(_$1.without(args.selectedContributions(), contribution.id));
            }
            return true;
        },
            stateClass = function stateClass(state) {
            var classes = {
                online: {
                    paid: 'text-success.fa-circle',
                    refunded: 'text-error.fa-circle',
                    pending_refund: 'text-error.fa-circle',
                    pending: 'text-waiting.fa-circle',
                    refused: 'text-error.fa-circle'
                },
                failed: {
                    paid: 'text-error.fa-circle-o',
                    refunded: 'text-refunded.fa-circle',
                    pending_refund: 'text-refunded.fa-circle-o',
                    pending: 'text-refunded',
                    refused: 'text-refunded'
                },
                waiting_funds: {
                    paid: 'text-success.fa-circle',
                    refunded: 'text-error.fa-circle',
                    pending_refund: 'text-error.fa-circle',
                    pending: 'text-waiting.fa-circle',
                    refused: 'text-error.fa-circle'
                },
                successful: {
                    paid: 'text-success.fa-circle',
                    refunded: 'text-error.fa-circle',
                    pending_refund: 'text-error.fa-circle',
                    pending: 'text-waiting.fa-circle',
                    refused: 'text-error.fa-circle'
                }
            };

            return classes[project.state][state];
        };

        return {
            stateClass: stateClass,
            checked: checked,
            selectContribution: selectContribution
        };
    },
    view: function view(ctrl, args) {
        var contribution = args.contribution(),
            project = args.project(),
            profileImg = _$1.isEmpty(contribution.profile_img_thumbnail) ? '/assets/catarse_bootstrap/user.jpg' : contribution.profile_img_thumbnail,
            reward = contribution.reward || {
            minimum_value: 0,
            description: 'No reward selected'
        };

        return m('.w-clearfix.card' + (ctrl.checked(contribution) ? '.card-alert' : ''), [m('.w-row', [m('.w-col.w-col-1.w-col-small-1.w-col-tiny-1', m('.w-inline-block', m('.w-checkbox.w-clearfix', contribution.delivery_status !== 'received' && project.state !== 'failed' ? m('input.w-checkbox-input[type=\'checkbox\']', {
            checked: ctrl.checked(contribution),
            value: contribution.id,
            onclick: function onclick() {
                return ctrl.selectContribution(contribution);
            }
        }) : ''))), m('.w-col.w-col-11.w-col-small-11.w-col-tiny-11', m('.w-row', [m('.w-col.w-col-1.w-col-tiny-1', [m('img.user-avatar.u-marginbottom-10[src=\'' + profileImg + '\']')]), m('.w-col.w-col-11.w-col-tiny-11', [m('.w-row', [m('.w-col.w-col-3', [m('.fontcolor-secondary.fontsize-mini.fontweight-semibold', h.momentify(contribution.created_at, 'DD/MM/YYYY, HH:mm')), m('.fontweight-semibold.fontsize-smaller.lineheight-tighter', contribution.user_name), m('.fontsize-smallest.lineheight-looser', [contribution.has_another ? [m('a.link-hidden-light.badge.badge-light', '+1 support ')] : '', contribution.anonymous ? m('span.fa.fa-eye-slash.fontcolor-secondary', m('span.fontcolor-secondary[style="font-size:11px;"]', ' Non-public support')) : '']), m('.fontsize-smallest.lineheight-looser', contribution.email)]), m('.w-col.w-col-3', [m('.lineheight-tighter', [m('span.fa.fontsize-smallest.' + ctrl.stateClass(contribution.state)), '   ', m('span.fontsize-large', 'Rs ' + h.formatNumber(contribution.value, 2, 3))])]), m('.w-col.w-col-3.w-hidden-small.w-hidden-tiny', [m('div', contribution.delivery_status === 'error' ? m('span.badge.badge-attention.fontsize-smaller', 'Error sending') : contribution.delivery_status === 'delivered' ? m('span.badge.badge-success.fontsize-smaller', 'Sent') : contribution.delivery_status === 'received' ? m('span.fontsize-smaller.badge.badge-success', [m('span.fa.fa-check-circle', ''), ' Received']) : ''), m('.fontsize-smallest.fontweight-semibold', 'Reward: ' + (reward.minimum_value ? h.formatNumber(reward.minimum_value, 2, 3) : '')), m('.fontsize-smallest.fontweight-semibold', reward.title), m('.fontsize-smallest.fontcolor-secondary', reward.description.substring(0, 80) + '...')])])])]))])]);
    }
};

var vm$5 = postgrest$1.filtersVM({
    full_text_index: '@@',
    state: 'in',
    reward_id: 'eq',
    delivery_status: 'eq',
    project_id: 'eq'
});
var paramToString$3 = function paramToString(p) {
    return (p || '').toString().trim();
};

vm$5.state('');
vm$5.order({
    id: 'desc'
});

vm$5.full_text_index.toFilter = function () {
    var filter = paramToString$3(vm$5.full_text_index());
    return filter && replaceDiacritics(filter) || undefined;
};

vm$5.getAllContributions = function (filterVM) {
    models.projectContribution.pageSize(false);
    var allContributions = postgrest$1.loaderWithToken(models.projectContribution.getPageOptions(filterVM.parameters())).load();
    models.projectContribution.pageSize(9);
    return allContributions;
};

vm$5.updateStatus = function (data) {
    return m.request({
        method: 'PUT',
        url: '/projects/' + vm$5.project_id() + '/contributions/update_status.json',
        data: data,
        config: h.setCsrfToken
    });
};

vm$5.withNullParameters = function () {
    var withNullVm = postgrest$1.filtersVM({
        full_text_index: '@@',
        state: 'in',
        reward_id: 'is',
        delivery_status: 'eq',
        project_id: 'eq'
    });

    withNullVm.full_text_index(vm$5.full_text_index());
    withNullVm.order(vm$5.order());
    withNullVm.state(vm$5.state());
    withNullVm.reward_id(vm$5.reward_id());
    withNullVm.delivery_status(vm$5.delivery_status());
    withNullVm.project_id(vm$5.project_id());

    return withNullVm.parameters();
};

/**
 * window.c.deliverContributionModalContent component
 * Render deliver contribution modal
 *
 */
var deliverContributionModalContent = {
    view: function view(ctrl, args) {
        return m('div', m('.modal-dialog-header', m('.fontsize-large.u-text-center', [m('span.fa.fa-check-circle', ''), ' Rewards on the way! Hurray !!!!'])), m('.modal-dialog-content', [m('p.fontsize-small.u-marginbottom-30', [m('span.fontweight-semibold', 'You selected ' + args.amount + ' Supports.'), ' Upon your confirmation, supporters who have made these supports for your project will be notified that their rewards will be delivered soon.']), m('.w-form', [m('form', [m('.fontsize-smaller', 'If you want to add some information in this message, use the space below! It`s a great time to thank those people who believed in you!'), m("textarea.height-mini.text-field.w-input[placeholder='Enter your message (optional)']", {
            value: args.message(),
            onchange: m.withAttr('value', args.message)
        })])]), m('.w-row', [m('.w-col.w-col-1'), m('.w-col.w-col-10', m('.fontsize-small.fontweight-semibold.u-marginbottom-20.u-text-center', 'Do you confirm that the rewards for the selected supports have been sent?')), m('.w-col.w-col-1')]), m('.w-row', [m('.w-col.w-col-1'), m('.w-col.w-col-5', m('a.btn.btn-medium.w-button', {
            onclick: function onclick() {
                return args.updateStatus('delivered');
            }
        }, 'Yes!')), m('.w-col.w-col-5', m('a.btn.btn-medium.btn-terciary.w-button', {
            onclick: args.displayModal.toggle
        }, 'Come back')), m('.w-col.w-col-1')])]));
    }
};

/**
 * window.c.errorContributionModalContent component
 * Render deliver error contribution modal
 *
 */
var errorContributionModalContent = {
    view: function view(ctrl, args) {
        return m('div', m('.modal-dialog-header', m('.fontsize-large.u-text-center', [m('span.fa.fa-exclamation-triangle', ''), ' Ops. Error sending!'])), m('.modal-dialog-content', [m('p.fontsize-small.u-marginbottom-30', [m('span.fontweight-semibold', 'You selected ' + args.amount + ' Supports.'), ' Upon your confirmation, the supporters who made these supports for your project will be notified that there was a problem with sending your rewards.']), m('.w-form', [m('form', [m('.fontsize-smaller', 'If you want to add some information in this message, use the space below (ex: you can request confirmation of delivery address or explain reasons for the error) '), m("textarea.height-mini.text-field.w-input[placeholder='Enter your message (optional)']", {
            value: args.message(),
            onchange: m.withAttr('value', args.message)
        })])]), m('.w-row', [m('.w-col.w-col-1'), m('.w-col.w-col-10', m('.fontsize-small.fontweight-semibold.u-marginbottom-20.u-text-center', 'Do you confirm that there was an error in sending the rewards of the selected supports?')), m('.w-col.w-col-1')]), m('.w-row', [m('.w-col.w-col-1'), m('.w-col.w-col-5', m('a.btn.btn-medium.w-button', {
            onclick: function onclick() {
                return args.updateStatus('error');
            }
        }, 'Yes!')), m('.w-col.w-col-5', m('a.btn.btn-medium.btn-terciary.w-button', {
            onclick: args.displayModal.toggle
        }, 'Come back')), m('.w-col.w-col-1')])]));
    }
};

var projectContributionReportContent = {
    controller: function controller(args) {
        var showSelectedMenu = h.toggleProp(false, true),
            selectedAny = m.prop(false),
            showSuccess = m.prop(false),
            loading = m.prop(false),
            displayDeliverModal = h.toggleProp(false, true),
            displayErrorModal = h.toggleProp(false, true),
            selectedContributions = m.prop([]),
            deliveryMessage = m.prop(''),
            selectAll = function selectAll() {
            vm$5.getAllContributions(args.filterVM).then(function (data) {
                var _selectedContribution;

                var exceptReceived = _$1.filter(data, function (contrib) {
                    return contrib.delivery_status !== 'received';
                });
                (_selectedContribution = selectedContributions()).push.apply(_selectedContribution, toConsumableArray(_$1.pluck(exceptReceived, 'id')));
                selectedAny(!_$1.isEmpty(exceptReceived));
            });
        },
            unselectAll = function unselectAll() {
            selectedContributions([]);
            selectedAny(false);
        },
            updateStatus = function updateStatus(status) {
            var data = {
                contributions: selectedContributions(),
                message: deliveryMessage(),
                delivery_status: status
            };
            if (status === 'delivered') {
                displayDeliverModal.toggle();
            } else if (status === 'error') {
                displayErrorModal.toggle();
            }
            loading(true);
            showSelectedMenu.toggle();
            m.redraw();
            vm$5.updateStatus(data).then(function () {
                loading(false);
                showSuccess(true);
                // update status so we don't have to reload the page
                _$1.map(_$1.filter(args.list.collection(), function (contrib) {
                    return _$1.contains(selectedContributions(), contrib.id);
                }), function (item) {
                    return item.delivery_status = status;
                });
            }).catch(function () {
                m.redraw();
            });
            return false;
        };

        return {
            showSuccess: showSuccess,
            selectAll: selectAll,
            unselectAll: unselectAll,
            deliveryMessage: deliveryMessage,
            displayDeliverModal: displayDeliverModal,
            displayErrorModal: displayErrorModal,
            updateStatus: updateStatus,
            loading: loading,
            showSelectedMenu: showSelectedMenu,
            selectedAny: selectedAny,
            selectedContributions: selectedContributions
        };
    },
    view: function view(ctrl, args) {
        var list = args.list;
        var isFailed = args.project().state === 'failed';

        return m('.w-section.bg-gray.before-footer.section', ctrl.loading() ? h.loader() : [ctrl.displayErrorModal() ? m.component(modalBox, {
            displayModal: ctrl.displayErrorModal,
            hideCloseButton: false,
            content: [errorContributionModalContent, { project: args.project, displayModal: ctrl.displayErrorModal, amount: ctrl.selectedContributions().length, updateStatus: ctrl.updateStatus, message: ctrl.deliveryMessage }]
        }) : '', ctrl.displayDeliverModal() ? m.component(modalBox, {
            displayModal: ctrl.displayDeliverModal,
            hideCloseButton: false,
            content: [deliverContributionModalContent, { project: args.project, displayModal: ctrl.displayDeliverModal, amount: ctrl.selectedContributions().length, updateStatus: ctrl.updateStatus, message: ctrl.deliveryMessage }]
        }) : '', ctrl.showSuccess() ? m.component(popNotification, {
            message: 'As informações foram atualizadas'
        }) : '', m('.w-container', [m('.u-marginbottom-40', m('.w-row', [m('.u-text-center-small-only.w-col.w-col-2', m('.fontsize-base.u-marginbottom-10', [m('span.fontweight-semibold', list.isLoading() ? '' : list.total()), ' Supports'])), m('.w-col.w-col-6', isFailed ? '' : [!ctrl.selectedAny() ? m('button.btn.btn-inline.btn-small.btn-terciary.u-marginright-20.w-button', {
            onclick: ctrl.selectAll
        }, 'Select All') : m('button.btn.btn-inline.btn-small.btn-terciary.u-marginright-20.w-button', {
            onclick: ctrl.unselectAll
        }, 'Deselect All'), ctrl.selectedAny() ? m('.w-inline-block', [m('button.btn.btn-inline.btn-small.btn-terciary.w-button', {
            onclick: ctrl.showSelectedMenu.toggle
        }, ['Mark ', m('span.w-hidden-tiny', 'delivery'), ' as']), ctrl.showSelectedMenu() ? m('.card.dropdown-list.dropdown-list-medium.u-radius.zindex-10[id=\'transfer\']', [m('a.dropdown-link.fontsize-smaller[href=\'#\']', {
            onclick: function onclick() {
                return ctrl.displayDeliverModal.toggle();
            }
        }, 'Sent'), m('a.dropdown-link.fontsize-smaller[href=\'#\']', {
            onclick: function onclick() {
                return ctrl.displayErrorModal.toggle();
            }
        }, 'Error sending')]) : '']) : '']), m('.w-clearfix.w-col.w-col-4', m('a.alt-link.fontsize-small.lineheight-looser.u-right', { onclick: function onclick() {
                return args.showDownloads(true);
            } }, [m('span.fa.fa-download', ''), ' Download reports']))])), _$1.map(list.collection(), function (item) {
            var contribution = m.prop(item);
            return m.component(projectContributionReportContentCard, {
                project: args.project,
                contribution: contribution,
                selectedContributions: ctrl.selectedContributions,
                selectedAny: ctrl.selectedAny
            });
        })]), m('.w-section.section.bg-gray', [m('.w-container', [m('.w-row.u-marginbottom-60', [m('.w-col.w-col-2.w-col-push-5', [!list.isLoading() ? list.isLastPage() ? '' : m('button#load-more.btn.btn-medium.btn-terciary', {
            onclick: list.nextPage
        }, 'Load more') : h.loader()])])])])]);
    }
};

var downloadReports = {
    view: function view(ctrl, args) {
        var project = args.project(),
            paidRewards = _$1.filter(args.rewards, function (reward) {
            return reward.paid_count > 0;
        });

        return m('section.min-height-70', m('.w-section', m('article', m('.section.project-metrics', m('.w-container', m('.w-row', [m('.w-col.w-col-2'), m('.w-col.w-col-8', m('.card.u-radius.u-marginbottom-20.card-terciary', [m('.fontsize-small.fontweight-semibold.u-marginbottom-20', [m('span.fa.fa-download', m.trust('&nbsp;')), 'Download reports']), m('ul.w-list-unstyled', [m('li.fontsize-smaller.u-marginbottom-10', m('div', ['Confirmed Supporters ', m.trust('&nbsp;'), m('a.alt-link[href=\'/en/reports/contribution_reports_for_project_owners.csv?project_id=' + project.project_id + '&amp;state=paid\']', 'CSV'), m.trust('&nbsp;'), '\\', m.trust('&nbsp;'), m('a.alt-link[href=\'/en/reports/contribution_reports_for_project_owners.xls?project_id=' + project.project_id + '&amp;state=paid\']', 'XLS')])), m('li.divider.u-marginbottom-10'), m('li.fontsize-smaller.u-marginbottom-10', m('div', ['Pending Supporters', m.trust('&nbsp;'), m.trust('&nbsp;'), m('a.alt-link[href=\'/en/reports/contribution_reports_for_project_owners.csv?project_id=' + project.project_id + '&amp;state=pending&amp;waiting_payment=true\']', 'CSV'), m.trust('&nbsp;'), '\\', m.trust('&nbsp;'), m('a.alt-link[href=\'/en/reports/contribution_reports_for_project_owners.xls?project_id=' + project.project_id + '&amp;state=pending&amp;waiting_payment=true\']', 'XLS')])), m('li.divider.u-marginbottom-10'), m('li.fontsize-smaller.u-marginbottom-10', m('div', ['Supporters who did not select reward', m.trust('&nbsp;'), m.trust('&nbsp;'), m('a.alt-link[href=\'/en/reports/contribution_reports_for_project_owners.csv?project_id=' + project.project_id + '&amp;reward_id=0&amp;state=paid\']', 'CSV'), m.trust('&nbsp;'), '\\', m.trust('&nbsp;'), m('a.alt-link[href=\'/en/reports/contribution_reports_for_project_owners.xls?project_id=' + project.project_id + '&amp;reward_id=0&amp;state=paid\']', 'XLS')])), _$1.map(paidRewards, function (reward) {
            return [m('li.divider.u-marginbottom-10'), m('li.fontsize-smaller.u-marginbottom-10', m('div', ['Rs ' + reward.minimum_value + ' ' + reward.description.substring(0, 40) + '...;', m('a.alt-link[href=\'/en/reports/contribution_reports_for_project_owners.csv?project_id=' + project.project_id + '&amp;reward_id=' + reward.id + '&amp;state=paid\']', 'CSV'), m.trust('&nbsp;'), '\\', m.trust('&nbsp;'), m('a.alt-link[href=\'/en/reports/contribution_reports_for_project_owners.xls?project_id=' + project.project_id + '&amp;reward_id=' + reward.id + '&amp;state=paid\']', 'XLS')]))];
        }), m('li.divider.u-marginbottom-10')])])), m('.w-col.w-col-2')]))))));
    }
};

var InfoProjectContributionLegend = {
    controller: function controller(args) {
        return {
            modalToggle: h.toggleProp(false, true)
        };
    },
    view: function view(ctrl, args) {
        return m('span', [args.text, m.trust('&nbsp;'), m('a.fa.fa-question-circle.fontcolor-secondary[href="#"]', {
            onclick: ctrl.modalToggle.toggle
        }, ''), ctrl.modalToggle() ? m.component(modalBox, {
            displayModal: ctrl.modalToggle,
            content: args.content
        }) : '']);
    }
};

var I18nScope$14 = _$1.partial(h.i18nScope, 'projects.contributions_report.legend_labels');

var ProjectContributionStateLegendModal = {
    controller: function controller(args) {
        var translate = function translate(path) {
            return I18n$1.t(path, I18nScope$14());
        };

        return {
            stages: {
                online: [{
                    label: translate('online.paid.label'),
                    text: translate('online.paid.text'),
                    i_class: '.fa.fa-circle.text-success'
                }, {
                    label: translate('online.pending.label'),
                    text: translate('online.pending.text'),
                    i_class: '.fa.fa-circle.text-waiting'
                }, {
                    label: translate('online.refunded.label'),
                    text: translate('online.refunded.text'),
                    i_class: '.fa.fa-circle.text-error'
                }],
                failed: [{
                    label: translate('failed.pending_refund.label'),
                    text: translate('failed.pending_refund.text'),
                    i_class: '.fa.fa-circle-o.text-refunded'
                }, {
                    label: translate('failed.refunded.label'),
                    text: translate('failed.refunded.text'),
                    i_class: '.fa.fa-circle.text-refunded'
                }, {
                    label: translate('failed.paid.label'),
                    text: translate('failed.paid.text'),
                    i_class: '.fa.fa-circle-o.text-error'
                }],
                successful: [{
                    label: translate('successful.paid.label'),
                    text: translate('successful.paid.text'),
                    i_class: '.fa.fa-circle.text-success'
                }, {
                    label: translate('successful.refunded.label'),
                    text: translate('successful.refunded.text'),
                    i_class: '.fa.fa-circle.text-error'
                }]

            }
        };
    },
    view: function view(ctrl, args) {
        var project = _$1.first(args.project()),
            project_stage = project.state == 'waiting_funds' ? 'online' : project.state;

        return m('div', [m('.modal-dialog-header', [m('.fontsize-large.u-text-center', 'Support Status')]), m('.modal-dialog-content', _$1.map(ctrl.stages[project_stage], function (item, i) {
            return m('.u-marginbottom-20', [m('.fontsize-small.fontweight-semibold', [m('span' + item.i_class), ' \xA0' + item.label]), m('.fontsize-smaller', m.trust(item.text))]);
        }))]);
    }
};

var ProjectContributionDeliveryLegendModal = {
    view: function view(ctrl, args) {
        return m('div', [m('.modal-dialog-header', [m('.fontsize-large.u-text-center', 'Delivery status')]), m('.modal-dialog-content', [m('.fontsize-smaller.u-marginbottom-30', 'All support has, by default, delivery status \'Not Sent \'. To assist in your control of rewards delivery, you can change these statuses and filter the search for supports with the following labels:'), m('.u-marginbottom-20', [m('.fontsize-smaller.fontweight-semibold', ['Not sent', m.trust('&nbsp;')]), m('.fontsize-smaller', 'You have not yet sent the reward to the supporter.')]), m('div', m('span.fontsize-smaller.badge.badge-success', 'Sent')), m('.u-marginbottom-20', m('.fontsize-smaller', 'You have already sent the reward to the supporter.')), m('.u-marginbottom-20', [m('div', m('span.fontsize-smaller.badge.badge-attention', 'Sending error')), m('.fontsize-smaller', 'You sent the reward, but there was a problem with the submission (ex: incorrect address).')]), m('.u-marginbottom-20', [m('div', m('span.fontsize-smaller.badge.badge-success', [m('span.fa.fa-check-circle', ''), ' Received'])), m('.fontsize-smaller', 'The supporter has marked the reward as \'Received \' in your control panel \o/')])]), m('.divider.u-marginbottom-10'), m('.fontcolor-secondary.fontsize-smaller.u-marginbottom-30', ['Note: even if the reward is not physical (like a digital copy, for example), you can still use the system above!'])]);
    }
};

var projectContributionReport = {
    controller: function controller(args) {
        var listVM = postgrest$1.paginationVM(models.projectContribution, 'id.desc', {
            Prefer: 'count=exact'
        }),
            filterVM = vm$5,
            project = m.prop([{}]),
            rewards = m.prop([]),
            showDownloads = m.prop(false),
            contributionStateOptions = m.prop([]),
            reloadSelectOptions = function reloadSelectOptions(projectState) {
            var opts = [{
                value: '',
                option: 'All'
            }];

            var optionsMap = {
                online: [{
                    value: 'paid',
                    option: 'Confirmed'
                }, {
                    value: 'pending',
                    option: 'Started'
                }, {
                    value: 'refunded,chargeback,deleted,pending_refund',
                    option: 'Contested'
                }],
                waiting_funds: [{
                    value: 'paid',
                    option: 'Confirmed'
                }, {
                    value: 'pending',
                    option: 'Started'
                }, {
                    value: 'refunded,chargeback,deleted,pending_refund',
                    option: 'Contested'
                }],
                failed: [{
                    value: 'pending_refund',
                    option: 'Refund in progress'
                }, {
                    value: 'refunded',
                    option: 'Refunded'
                }, {
                    value: 'paid',
                    option: 'Refund not started'
                }],
                successful: [{
                    value: 'paid',
                    option: 'Confirmed'
                }, {
                    value: 'refunded,chargeback,deleted,pending_refund',
                    option: 'Contested'
                }]
            };

            opts = opts.concat(optionsMap[projectState] || []);

            contributionStateOptions(opts);
        },

        // filterBuilder = [{
        //         component: FilterMain,
        //         data: {
        //             inputWrapperClass: '.w-input.text-field',
        //             btnClass: '.btn.btn-medium',
        //             vm: filterVM.full_text_index,
        //             placeholder: 'Search by name or email of the supporter'
        //         }
        //     },
        //     {
        //         label: 'reward_filter',
        //         component: FilterDropdown,
        //         data: {
        //             label: 'Reward selected',
        //             name: 'reward_id',
        //             vm: filterVM.reward_id,
        //             wrapper_class: '._w-sub-col.w-col.w-col-4',
        //             options: []
        //         }
        //     },
        //     {
        //         label: 'delivery_filter',
        //         component: FilterDropdown,
        //         data: {
        //             label: 'Delivery status',
        //             name: 'delivery_status',
        //             vm: filterVM.delivery_status,
        //             wrapper_class: '.w-col.w-col-4',
        //             options: [{
        //                     value: '',
        //                     option: 'All'
        //                 },
        //                 {
        //                     value: 'undelivered',
        //                     option: 'Not sent'
        //                 },
        //                 {
        //                     value: 'delivered',
        //                     option: 'Sent'
        //                 },
        //                 {
        //                     value: 'error',
        //                     option: 'Error sending'
        //                 },
        //                 {
        //                     value: 'received',
        //                     option: 'Received'
        //                 }
        //             ]
        //         }
        //     },
        //     {
        //         label: 'payment_state',
        //         component: FilterDropdown,
        //         data: {
        //             custom_label: [InfoProjectContributionStateLegend, {
        //                 text: 'Support Status',
        //                 project: project
        //             }],
        //             name: 'state',
        //             vm: filterVM.state,
        //             wrapper_class: '._w-sub-col.w-col.w-col-4',
        //             options: contributionStateOptions
        //         }
        //     }
        // ],
        submit = function submit() {
            if (filterVM.reward_id() === 'null') {
                listVM.firstPage(filterVM.withNullParameters()).then(null);
            } else {
                listVM.firstPage(filterVM.parameters()).then(null);
            }

            return false;
        },
            filterBuilder = [{
            component: filterMain,
            data: {
                inputWrapperClass: '.w-input.text-field',
                btnClass: '.btn.btn-medium',
                vm: filterVM.full_text_index,
                placeholder: 'Search by name or email'
            }
        }, {
            label: 'reward_filter',
            component: filterDropdown,
            data: {
                label: 'Reward selected',
                onchange: submit,
                name: 'reward_id',
                vm: filterVM.reward_id,
                wrapper_class: '.w-sub-col.w-col.w-col-4',
                options: []
            }
        }, {
            label: 'delivery_filter',
            component: filterDropdown,
            data: {
                custom_label: [InfoProjectContributionLegend, {
                    content: [ProjectContributionDeliveryLegendModal],
                    text: 'Delivery Status'
                }],
                onchange: submit,
                name: 'delivery_status',
                vm: filterVM.delivery_status,
                wrapper_class: '.w-col.w-col-4',
                options: [{
                    value: '',
                    option: 'All'
                }, {
                    value: 'undelivered',
                    option: 'Not sent'
                }, {
                    value: 'delivered',
                    option: 'Sent'
                }, {
                    value: 'error',
                    option: 'Sending error'
                }, {
                    value: 'received',
                    option: 'Received'
                }]
            }
        }, {
            label: 'payment_state',
            component: filterDropdown,
            data: {
                custom_label: [InfoProjectContributionLegend, {
                    text: 'Support Status',
                    content: [ProjectContributionStateLegendModal, {
                        project: project
                    }]
                }],
                name: 'state',
                onchange: submit,
                vm: filterVM.state,
                wrapper_class: '.w-sub-col.w-col.w-col-4',
                options: contributionStateOptions
            }
        }];

        filterVM.project_id(args.project_id);

        var lReward = postgrest$1.loaderWithToken(models.rewardDetail.getPageOptions({
            project_id: 'eq.' + filterVM.project_id()
        }));
        var lProject = postgrest$1.loaderWithToken(models.projectDetail.getPageOptions({
            project_id: 'eq.' + filterVM.project_id()
        }));

        lReward.load().then(rewards);
        lProject.load().then(function (data) {
            project(data);
            reloadSelectOptions(_$1.first(data).state);
        });

        var mapRewardsToOptions = function mapRewardsToOptions() {
            var options = [];
            if (!lReward()) {
                options = _$1.map(rewards(), function (r) {
                    return {
                        value: r.id,
                        option: 'Rs ' + h.formatNumber(r.minimum_value, 2, 3) + ' - ' + (r.title ? r.title : r.description).substring(0, 20)
                    };
                });
            }

            options.unshift({
                value: null,
                option: 'No reward'
            });

            options.unshift({
                value: '',
                option: 'All'
            });

            return options;
        };

        if (!listVM.collection().length) {
            listVM.firstPage(filterVM.parameters());
        }

        return {
            listVM: listVM,
            filterVM: filterVM,
            filterBuilder: filterBuilder,
            submit: submit,
            lProject: lProject,
            rewards: rewards,
            project: project,
            showDownloads: showDownloads,
            mapRewardsToOptions: mapRewardsToOptions
        };
    },
    view: function view(ctrl) {
        var list = ctrl.listVM;

        if (!ctrl.lProject()) {
            return m('', [m.component(projectDashboardMenu, {
                project: m.prop(_$1.first(ctrl.project()))
            }), ctrl.showDownloads() ? m(downloadReports, {
                project: m.prop(_$1.first(ctrl.project())),
                rewards: ctrl.rewards()
            }) : [m('.w-section.section-product.' + _$1.first(ctrl.project()).mode), m.component(projectContributionReportHeader, {
                submit: ctrl.submit,
                filterBuilder: ctrl.filterBuilder,
                form: ctrl.filterVM.formDescriber,
                mapRewardsToOptions: ctrl.mapRewardsToOptions,
                filterVM: ctrl.filterVM
            }), m('.divider.u-margintop-30'), m.component(projectContributionReportContent, {
                submit: ctrl.submit,
                list: list,
                showDownloads: ctrl.showDownloads,
                filterVM: ctrl.filterVM,
                project: m.prop(_$1.first(ctrl.project()))
            })]]);
        }
        return m('', h.loader());
    }
};

/**
 * window.c.root.ProjectsDashboard component
 * A root component to manage projects
 *
 * Example:
 * To mount this component just create a DOM element like:
 * <div data-mithril="ProjectsDashboard">
 */
var projectsDashboard = {
    controller: function controller(args) {
        projectVM.init(args.project_id, args.project_user_id);

        return projectVM;
    },
    view: function view(ctrl) {
        var project = ctrl.currentProject;

        return project().is_owner_or_admin ? m.component(projectDashboardMenu, { project: project }) : '';
    }
};

/**
 * window.c.Search component
 * Returns a search input
 *
 * Example:
 * m.component(c.Search, {action: '/search', method: 'GET'})
 */

var I18nScope$16 = _.partial(h.i18nScope, 'layouts');

var search = {
    view: function view(ctrl) {
        var args = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        var action = args.action || '/en/explore?ref=ctrse_explore_pgsearch',
            method = args.method || 'GET';

        return m('#search.w-container.w-hidden-main.w-hidden-medium', [m('.w-row', [m('.w-col.w-col-10.u-marginbottom-20', [m('.w-form', [m('form#email-form', { action: action, method: method }, [m('.w-row', [m('.w-col.w-col-10.w-col-small-10.w-col-tiny-10', [m('input[type="text"][name="pg_search"][placeholder=' + I18n$1.t('header.search', I18nScope$16()) + ']#pg_search_inside.w-input.text-field.negative.prefix')]), m('.w-col.w-col-2.w-col-small-2.w-col-tiny-2', [m('button.w-inline-block.btn.btn-dark.btn-attached.postfix', [m('img.header-lupa[src="https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/54e44178b2135fce2b6cd235_lupa.png"]')])])])])])])])]);
    }
};

/**
 * window.c.CategoryButton component
 * Return a link with a btn-category class.
 * It uses a category parameter.
 *
 * Example:
 * m.component(c.CategoryButton, {
 *     category: {
 *         id: 1,
 *         name: 'Video',
 *         online_projects: 1
 *     }
 * })
 */
var categoryButton = {
    view: function view(ctrl, args) {
        var category = args.category;

        return m('.w-col.w-col-2.w-col-small-6.w-col-tiny-6', [m('a.w-inline-block.btn-category[href=\'#by_category_id/' + category.id + '\']', [m('div', [category.name, m('span.badge.explore', category.online_projects)])])]);
    }
};

var I18nScope$17 = _$1.partial(h.i18nScope, 'fb_connect');

var UnsignedFriendFacebookConnect = {
    controller: function controller(args) {
        return {
            largeBg: function () {
                if (_$1.isUndefined(args)) {
                    return false;
                }
                return _$1.isUndefined(args.largeBg) ? false : args.largeBg;
            }()
        };
    },
    view: function view(ctrl, args) {
        return m('.w-section.section' + (ctrl.largeBg ? '.bg-backs-carrosel.section-large' : ''), [m('.w-container', [m('.card.card-big', [m('.w-row', [m('.w-col.w-col-8', [m('.fontsize-largest.u-marginbottom-20', I18n$1.t('find_project', I18nScope$17())), m('.fontsize-small', I18n$1.t('with', I18nScope$17()))]), m('.w-col.w-col-4', [m('a.w-button.btn.btn-fb.btn-large.u-margintop-30.u-marginbottom-10[href="/connect-facebook"]', I18n$1.t('connect', I18nScope$17())), m('.fontsize-smallest.fontcolor-secondary.u-text-center', I18n$1.t('oath', I18nScope$17()))])])])])]);
    }
};

/**
 * window.root.ProjectsExplore component
 * A root component to show projects according to user defined filters
 *
 * Example:
 * To mount this component just create a DOM element like:
 * <div data-mithril="ProjectsExplore">
 */
var I18nScope$15 = _$1.partial(h.i18nScope, 'pages.explore');
// TODO Slim down controller by abstracting logic to view-models where it fits
var projectsExplore = {
    controller: function controller(args) {
        var filters = postgrest$1.filtersVM,
            projectFiltersVM$$1 = projectFiltersVM(),
            filtersMap = projectFiltersVM$$1.filters,
            defaultFilter = h.paramByName('filter') || 'all',
            fallbackFilter = 'all',
            currentFilter = m.prop(filtersMap[defaultFilter]),
            changeFilter = function changeFilter(newFilter) {
            currentFilter(filtersMap[newFilter]);
            loadRoute();
        },
            resetContextFilter = function resetContextFilter() {
            currentFilter(filtersMap[defaultFilter]);
            projectFiltersVM$$1.setContextFilters(['finished', 'all', 'contributed_by_friends']);
        },
            currentUser = h.getUser() || {},
            hasFBAuth = currentUser.has_fb_auth,
            buildTooltip = function buildTooltip(tooltipText) {
            return m.component(tooltip, {
                el: '.tooltip-wrapper.fa.fa-question-circle.fontcolor-secondary',
                text: tooltipText,
                width: 380
            });
        },
            hint = function hint() {
            // TODO Add copies to i18n.
            var hintText = '',
                tooltipText = '',
                hasHint = false;
            if (currentFilter().keyName === 'all') {
                hasHint = true;
                hintText = 'Sorted By Popularity ';
                tooltipText = 'Our popularity factor is a mix of Grasruts team`s selection with a value that is calculated by the speed of fund collection of the campaign';
            } else if (currentFilter().keyName === 'finished') {
                hasHint = true;
                hintText = 'Sorted By Rs Collected';
                tooltipText = 'Campaigns with the highest collection goal achieved are at the top';
            } else if (currentFilter().keyName === 'contributed_by_friends') {
                hasHint = true;
                hintText = 'Campaigns Supported By Friends ';
                tooltipText = 'Campaigns Supported By Friends';
            }

            return hasHint ? m('.fontsize-smaller.fontcolor-secondary', [hintText, buildTooltip(tooltipText)]) : '';
        },
            isSearch = m.prop(false),
            categoryCollection = m.prop([]),
            categoryId = m.prop(),
            findCategory = function findCategory(id) {
            return _$1.find(categoryCollection(), function (c) {
                return c.id === parseInt(id);
            });
        },
            category = _$1.compose(findCategory, categoryId),
            loadCategories = function loadCategories() {
            return models.category.getPageWithToken(filters({}).order({ name: 'asc' }).parameters()).then(categoryCollection);
        },
            externalLinkCategories = I18n$1.translations[I18n$1.currentLocale()].projects.index.explore_categories,
            hasSpecialFooter = function hasSpecialFooter(categoryId) {
            return !_$1.isUndefined(externalLinkCategories[categoryId]);
        },

        // just small fix when have two scored projects only
        checkForMinScoredProjects = function checkForMinScoredProjects(collection) {
            return _$1.size(_$1.filter(collection, function (x) {
                return x.score >= 1;
            })) >= 3;
        },

        // Fake projects object to be able to render page while loadding (in case of search)
        projects = m.prop({ collection: m.prop([]), isLoading: function isLoading() {
                return true;
            }, isLastPage: function isLastPage() {
                return true;
            } }),
            loadRoute = function loadRoute() {
            var route = window.location.hash.match(/\#([^\/]*)\/?(\d+)?/),
                cat = route && route[2] && findCategory(route[2]),
                filterFromRoute = function filterFromRoute() {
                var byCategory = filters({
                    category_id: 'eq'
                });

                return route && route[1] && filtersMap[route[1]] || cat && { title: cat.name, filter: byCategory.category_id(cat.id) };
            },
                filter = filterFromRoute() || currentFilter(),
                search$$1 = h.paramByName('pg_search'),
                searchProjects = function searchProjects() {
                var l = postgrest$1.loaderWithToken(models.projectSearch.postOptions({ query: search$$1 })),
                    page = { // We build an object with the same interface as paginationVM
                    collection: m.prop([]),
                    isLoading: l,
                    isLastPage: function isLastPage() {
                        return true;
                    },
                    nextPage: function nextPage() {
                        return false;
                    }
                };
                l.load().then(page.collection);
                return page;
            },
                loadProjects = function loadProjects() {
                var pages = postgrest$1.paginationVM(models.project);
                var parameters = _$1.extend({}, currentFilter().filter.parameters(), filter.filter.order({
                    open_for_contributions: 'desc',
                    state_order: 'asc',
                    state: 'desc',
                    score: 'desc',
                    pledged: 'desc'
                }).parameters());
                pages.firstPage(parameters);
                return pages;
            },
                loadFinishedProjects = function loadFinishedProjects() {
                var pages = postgrest$1.paginationVM(models.finishedProject),
                    parameters = _$1.extend({}, currentFilter().filter.parameters(), filter.filter.order({
                    state_order: 'asc',
                    state: 'desc',
                    pledged: 'desc'
                }).parameters());
                pages.firstPage(parameters);

                return pages;
            };

            if (_$1.isString(search$$1) && search$$1.length > 0 && route === null) {
                isSearch(true);
                title('Search ' + search$$1);
                projects(searchProjects());
            } else if (currentFilter().keyName === 'finished') {
                isSearch(false);
                projects(loadFinishedProjects());
            } else {
                isSearch(false);
                title(filter.title);
                if (!_$1.isNull(route) && route[1] == 'finished') {
                    projects(loadFinishedProjects());
                } else {
                    projects(loadProjects());
                }
            }
            categoryId(cat && cat.id);
            route || _$1.isString(search$$1) && search$$1.length > 0 ? toggleCategories(false) : toggleCategories(true);
        },
            title = m.prop(),
            toggleCategories = h.toggleProp(false, true);

        window.addEventListener('hashchange', function () {
            resetContextFilter();
            loadRoute();
            m.redraw();
        }, false);

        // Initial loads
        resetContextFilter();
        models.project.pageSize(9);
        loadCategories().then(loadRoute);

        if (args.filter) {
            currentFilter(filtersMap[args.filter]);
        }

        if (!currentFilter()) {
            currentFilter(filtersMap[defaultFilter]);
        }

        return {
            categories: categoryCollection,
            changeFilter: changeFilter,
            fallbackFilter: fallbackFilter,
            projects: projects,
            category: category,
            title: title,
            hint: hint,
            filtersMap: filtersMap,
            currentFilter: currentFilter,
            projectFiltersVM: projectFiltersVM$$1,
            toggleCategories: toggleCategories,
            isSearch: isSearch,
            hasFBAuth: hasFBAuth,
            checkForMinScoredProjects: checkForMinScoredProjects,
            categoryId: categoryId,
            hasSpecialFooter: hasSpecialFooter,
            externalLinkCategories: externalLinkCategories
        };
    },
    view: function view(ctrl, args) {
        var categoryId = ctrl.categoryId,
            projectsCollection = ctrl.projects().collection(),
            projectsCount = projectsCollection.length,
            filterKeyName = ctrl.currentFilter().keyName,
            isContributedByFriendsFilter = filterKeyName === 'contributed_by_friends',
            hasSpecialFooter = ctrl.hasSpecialFooter(categoryId());
        var widowProjects = [];

        if (!ctrl.projects().isLoading() && _$1.isEmpty(projectsCollection) && !ctrl.isSearch()) {
            if (!(isContributedByFriendsFilter && !ctrl.hasFBAuth)) {
                ctrl.projectFiltersVM.removeContextFilter(ctrl.currentFilter());
                ctrl.changeFilter(ctrl.fallbackFilter);
            }
        }

        return m('#explore', { config: h.setPageTitle(I18n$1.t('header_html', I18nScope$15())) }, [m('.w-section.hero-search', [m.component(search), m('.w-container.u-marginbottom-10', [m('.u-text-center.u-marginbottom-40', [m('a#explore-open.link-hidden-white.fontweight-light.fontsize-larger[href="javascript:void(0);"]', { onclick: function onclick() {
                return ctrl.toggleCategories.toggle();
            } }, ['Explore Incredible Campaigns ', m('span#explore-btn.fa.fa-angle-down' + (ctrl.toggleCategories() ? '.opened' : ''), '')])]), m('#categories.category-slider' + (ctrl.toggleCategories() ? '.opened' : ''), [m('.w-row.u-marginbottom-30', [_$1.map(ctrl.categories(), function (category) {
            return m.component(categoryButton, { category: category });
        })])])])]), m('.w-section', [m('.w-container', [m('.w-row', [m('.w-col.w-col-9.w-col-small-8.w-col-tiny-8', [m('.fontsize-larger', ctrl.title()), ctrl.hint()]), m('.w-col.w-col-3.w-col-small-4.w-col-tiny-4', !ctrl.isSearch() ? m('select.w-select.text-field.positive', { onchange: m.withAttr('value', ctrl.changeFilter) }, _$1.map(ctrl.projectFiltersVM.getContextFilters(), function (pageFilter, idx) {
            var isSelected = ctrl.currentFilter() === pageFilter;

            return m('option[value="' + pageFilter.keyName + '"]', { selected: isSelected }, pageFilter.nicename);
        })) : '')])])]), isContributedByFriendsFilter && _$1.isEmpty(projectsCollection) ? !ctrl.hasFBAuth ? m.component(UnsignedFriendFacebookConnect) : '' : '', m('.w-section.section', [m('.w-container', [m('.w-row', [m('.w-row', _$1.map(projectsCollection, function (project, idx) {
            var cardType = 'small',
                ref = 'ctrse_explore';

            if (ctrl.isSearch()) {
                ref = 'ctrse_explore_pgsearch';
            } else if (isContributedByFriendsFilter) {
                ref = 'ctrse_explore_friends';
            } else if (filterKeyName === 'all') {
                if (project.score >= 1) {
                    if (idx === 0) {
                        cardType = 'big';
                        ref = 'ctrse_explore_featured_big';
                        widowProjects = [projectsCount - 1, projectsCount - 2];
                    } else if (idx === 1 || idx === 2) {
                        if (ctrl.checkForMinScoredProjects(projectsCollection)) {
                            cardType = 'medium';
                            ref = 'ctrse_explore_featured_medium';
                            widowProjects = [];
                        } else {
                            cardType = 'big';
                            ref = 'ctrse_explore_featured_big';
                            widowProjects = [projectsCount - 1];
                        }
                    } else {
                        ref = 'ctrse_explore_featured';
                    }
                }
            }

            return _$1.indexOf(widowProjects, idx) > -1 && !ctrl.projects().isLastPage() ? '' : m.component(projectCard, { project: project, ref: ref, type: cardType, showFriends: isContributedByFriendsFilter });
        })), ctrl.projects().isLoading() ? h.loader() : _$1.isEmpty(projectsCollection) && ctrl.hasFBAuth ? m('.fontsize-base.w-col.w-col-12', 'No campaigns to show.') : ''])])]), m('.w-section.u-marginbottom-80', [m('.w-container', [m('.w-row', [m('.w-col.w-col-2.w-col-push-5', [ctrl.projects().isLastPage() || ctrl.projects().isLoading() || _$1.isEmpty(projectsCollection) ? '' : m('a.btn.btn-medium.btn-terciary[href=\'#loadMore\']', { onclick: function onclick() {
                ctrl.projects().nextPage();return false;
            } }, 'Load more')])])])]), m('.w-section.section-large.before-footer.u-margintop-80.bg-gray.divider', [m('.w-container.u-text-center', [m('img.u-marginbottom-20.icon-hero', {
            src: hasSpecialFooter ? ctrl.externalLinkCategories[categoryId()].icon : 'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/56f4414d3a0fcc0124ec9a24_icon-launch-explore.png'
        }), m('h2.fontsize-larger.u-marginbottom-60', hasSpecialFooter ? ctrl.externalLinkCategories[categoryId()].title : 'Launch your campaign on Grasruts!'), m('.w-row', [m('.w-col.w-col-4.w-col-push-4', [hasSpecialFooter ? m('a.w-button.btn.btn-large', { href: ctrl.externalLinkCategories[categoryId()].link + '?ref=ctrse_explore' }, ctrl.externalLinkCategories[categoryId()].cta) : m('a.w-button.btn.btn-large', { href: '/start?ref=ctrse_explore' }, 'Learn how')])])])])]);
    }
};

var homeVM = function homeVM() {
    var i18nStart = I18n$1.translations[I18n$1.currentLocale()].projects.home,
        banners = i18nStart.banners;

    return {
        banners: banners
    };
};

/**
 * window.c.Slider component
 * Build a slider from any array of mithril elements
 *
 * Example of use:
 * view: () => {
 *     ...
 *     m.component(c.Slider, {
 *         slides: [m('slide1'), m('slide2'), m('slide3')],
 *         title: 'O que estão dizendo por aí...'
 *     })
 *     ...
 * }
 */

var slider = {
    controller: function controller(args) {
        var interval = void 0;
        var selectedSlideIdx = m.prop(0),
            translationSize = m.prop(1600),
            sliderTime = args.sliderTime || 6500,
            decrementSlide = function decrementSlide() {
            if (selectedSlideIdx() > 0) {
                selectedSlideIdx(selectedSlideIdx() - 1);
            } else {
                selectedSlideIdx(args.slides.length - 1);
            }
        },
            incrementSlide = function incrementSlide() {
            if (selectedSlideIdx() < args.slides.length - 1) {
                selectedSlideIdx(selectedSlideIdx() + 1);
            } else {
                selectedSlideIdx(0);
            }
        },
            startSliderTimer = function startSliderTimer() {
            interval = setInterval(function () {
                incrementSlide();
                m.redraw();
            }, sliderTime);
        },
            resetSliderTimer = function resetSliderTimer() {
            clearInterval(interval);
            startSliderTimer();
        },
            config = function config(el, isInitialized, context) {
            if (!isInitialized) {
                translationSize(Math.max(document.documentElement.clientWidth, window.innerWidth || 0));
                m.redraw();
            }

            context.onunload = function () {
                return clearInterval(interval);
            };
        };

        startSliderTimer();

        return {
            config: config,
            selectedSlideIdx: selectedSlideIdx,
            translationSize: translationSize,
            decrementSlide: decrementSlide,
            incrementSlide: incrementSlide,
            resetSliderTimer: resetSliderTimer
        };
    },
    view: function view(ctrl, args) {
        var slideClass = args.slideClass || '',
            wrapperClass = args.wrapperClass || '',
            effect = args.effect || 'slide',
            sliderClick = function sliderClick(fn, param) {
            fn(param);
            ctrl.resetSliderTimer();
            args.onchange && args.onchange();
        },
            effectStyle = function effectStyle(idx, translateStr) {
            var slideFx = 'transform: ' + translateStr + '; -webkit-transform: ' + translateStr + '; -ms-transform:' + translateStr,
                fadeFx = idx === ctrl.selectedSlideIdx() ? 'opacity: 1; visibility: visible;' : 'opacity: 0; visibility: hidden;';

            return effect === 'fade' ? fadeFx : slideFx;
        };

        return m('.w-slider.' + wrapperClass, {
            config: ctrl.config
        }, [m('.fontsize-larger', args.title), m('.w-slider-mask', [_$1.map(args.slides, function (slide, idx) {
            var translateValue = (idx - ctrl.selectedSlideIdx()) * ctrl.translationSize(),
                translateStr = 'translate3d(' + translateValue + 'px, 0, 0)';

            return m('.slide.w-slide.' + slideClass, {
                style: effectStyle(idx, translateStr) + ' ' + slide.customStyle
            }, [m('.w-container', [m('.w-row', [m('.w-col.w-col-8.w-col-push-2', slide.content)])])]);
        }), m('#slide-prev.w-slider-arrow-left.w-hidden-small.w-hidden-tiny', {
            onclick: function onclick() {
                return sliderClick(ctrl.decrementSlide);
            }
        }, [m('.w-icon-slider-left.fa.fa-lg.fa-angle-left.fontcolor-terciary')]), m('#slide-next.w-slider-arrow-right.w-hidden-small.w-hidden-tiny', {
            onclick: function onclick() {
                return sliderClick(ctrl.incrementSlide);
            }
        }, [m('.w-icon-slider-right.fa.fa-lg.fa-angle-right.fontcolor-terciary')]), m('.w-slider-nav.w-slider-nav-invert.w-round.slide-nav', _$1(args.slides.length).times(function (idx) {
            return m('.slide-bullet.w-slider-dot' + (ctrl.selectedSlideIdx() === idx ? '.w-active' : ''), {
                onclick: function onclick() {
                    return sliderClick(ctrl.selectedSlideIdx, idx);
                }
            });
        }))])]);
    }
};

/*       */
var blogVM = {
    getBlogPosts: function getBlogPosts() {
        var deferred = m.deferred();
        var posts = _$1.first(document.getElementsByTagName('body')).getAttribute('data-blog');

        if (posts) {
            deferred.resolve(JSON.parse(posts));
        } else {
            m.request({ method: 'GET', url: '/posts' }).then(deferred.resolve).catch(deferred.reject);
        }

        return deferred.promise;
    }
};

//      
var blogBanner = {
    controller: function controller(args) {
        var posts = m.prop([]),
            error = m.prop(false);

        blogVM.getBlogPosts().then(posts).catch(error);
        return { posts: posts, error: error };
    },
    view: function view(ctrl, args) {

        return m('section.section-large.bg-gray.before-footer[id=\'blog\']', m('.w-container', [m('.u-text-center', [m('a[href=\'http://blogs.grasruts.com\'][target=\'blank\']', m('img.u-marginbottom-10[alt=\'Icon blog\'][src=\'/assets/icon-blog.png\']')), m('.fontsize-large.u-marginbottom-60.text-success', m('a.link-hidden-success[href=\'http://blogs.grasruts.com\'][target=\'__blank\']', 'Grasruts Blogs'))]), m('.w-row', _$1.map(ctrl.posts(), function (post) {
            return m('.w-col.w-col-4.col-blog-post', [m('a.link-hidden.fontweight-semibold.fontsize-base.u-marginbottom-10[href="' + post[2][1] + '"][target=\'__blank\']', post[0][1])]);
        })), ctrl.error() ? m('.w-row', m('.w-col.w-col-12.u-text-center', 'Error loading posts...')) : '']));
    }
};

var I18nScope$18 = _$1.partial(h.i18nScope, 'projects.home');

var projectsHome = {
    controller: function controller(args) {
        var sample6 = _$1.partial(_$1.sample, _$1, 6),
            loader = postgrest$1.loaderWithToken,
            project = models.project,
            filters = projectFiltersVM().filters,
            userFriendVM = postgrest$1.filtersVM({ user_id: 'eq' }),
            friendListVM = postgrest$1.paginationVM(models.userFriend, 'user_id.desc', {
            Prefer: 'count=exact'
        }),
            currentUser = h.getUser() || {},
            hasFBAuth = currentUser.has_fb_auth,
            vm = homeVM();

        project.pageSize(20);

        userFriendVM.user_id(currentUser.user_id);

        if (hasFBAuth && !friendListVM.collection().length) {
            friendListVM.firstPage(userFriendVM.parameters());
        }

        var collections = _$1.map(['score', 'contributed_by_friends'], function (name) {
            var f = filters[name],
                cLoader = loader(project.getPageOptions(_$1.extend({}, { order: 'score.desc' }, f.filter.parameters()))),
                collection = m.prop([]);

            cLoader.load().then(_$1.compose(collection, sample6));

            return {
                title: f.nicename,
                hash: name === 'score' ? 'all' : name,
                collection: collection,
                loader: cLoader,
                showFriends: name === 'contributed_by_friends'
            };
        });

        return {
            collections: collections,
            slidesContent: vm.banners,
            hasFBAuth: hasFBAuth
        };
    },
    view: function view(ctrl) {
        var slides = function slides() {
            return _$1.map(ctrl.slidesContent, function (slide) {
                var customStyle = 'background-image: url(' + slide.image + ');';
                var content = m('.w-container.u-text-center', [m('.w-row.u-marginbottom-40', [m('h1.fontcolor-negative.fontsize-megajumbo.u-marginbottom-20', m.trust(slide.title)), m('h2.fontcolor-negative.fontsize-large', m.trust(slide.subtitle))]), m('a.btn.btn-large.u-marginbottom-10.btn-inline', { href: slide.link, target: '__blank' }, slide.cta)]);

                return {
                    content: content,
                    customStyle: customStyle
                };
            });
        };

        return m('#projects-home-component', { config: h.setPageTitle(I18n$1.t('header_html', I18nScope$18())) }, [
        // m.component(menu, {transparent: true}),
        m.component(slider, {
            slides: slides(),
            effect: 'fade',
            slideClass: 'hero-slide start',
            wrapperClass: 'hero-full hero-full-slide',
            sliderTime: 10000
        }), _$1.map(ctrl.collections, function (collection) {
            return m.component(projectRow, {
                collection: collection,
                title: collection.title,
                ref: 'home_' + (collection.hash === 'all' ? 'score' : collection.hash),
                showFriends: collection.showFriends
            });
        }),
        // m.component(contributionActivities),
        !ctrl.hasFBAuth ? m.component(UnsignedFriendFacebookConnect, { largeBg: true }) : '', m.component(blogBanner)
        // m.component(footer, {expanded: true}),
        // m.component(contributionActivities)
        ]);
    }
};

var projectShareBox = {
    controller: function controller() {
        return {
            displayEmbed: h.toggleProp(false, true)
        };
    },
    view: function view(ctrl, args) {
        return m('.pop-share', {
            style: 'display: block;'
        }, [m('.w-hidden-main.w-hidden-medium.w-clearfix', [m('a.btn.btn-small.btn-terciary.btn-inline.u-right', {
            onclick: args.displayShareBox.toggle
        }, 'Close'), m('.fontsize-small.fontweight-semibold.u-marginbottom-30', 'Share this project')]), m('.w-widget.w-widget-twitter.w-hidden-small.w-hidden-tiny.share-block', [m('iframe[allowtransparency="true"][width="120px"][height="22px"][frameborder="0"][scrolling="no"][src="//platform.twitter.com/widgets/tweet_button.8d007ddfc184e6776be76fe9e5e52d69.en.html#_=1442425984936&count=horizontal&dnt=false&id=twitter-widget-1&lang=en&original_referer=http%3A%2F%2Fwww.grasruts.com%2Fen%2F' + args.project().permalink + '&size=m&text=Check%20out%20the%20campaign%20' + args.project().name + '%20at%20%40grasruts&type=share&url=http%3A%2F%2Fwww.grasruts.com%2Fen%2F' + args.project().permalink + '%3Fref%3Dtwitter%26utm_source%3Dtwitter.com%26utm_medium%3Dsocial%26utm_campaign%3Dproject_share&via=grasruts"]')]), m('a.w-hidden-small.widget-embed.w-hidden-tiny.fontsize-small.link-hidden.fontcolor-secondary[href="js:void(0);"]', {
            onclick: ctrl.displayEmbed.toggle
        }, '< embed >'), ctrl.displayEmbed() ? m('.embed-expanded.u-margintop-30', [m('.fontsize-small.fontweight-semibold.u-marginbottom-20', 'Insert a widget on your site'), m('.w-form', [m('input.w-input[type="text"][value="<iframe frameborder="0" height="340px" src="http://www.grasruts.com/en/projects/' + args.project().project_id + '/embed" width="300px" scrolling="no"></iframe>"]')]), m('.card-embed', [m('iframe[frameborder="0"][height="350px"][src="/projects/' + args.project().project_id + '/embed"][width="300px"][scrolling="no"]')])]) : '', args.project().permalink ? m.component(facebookButton, {
            mobile: true,
            url: 'http://www.grasruts.com/' + args.project().permalink + '?ref=facebook&utm_source=facebook.com&utm_medium=social&utm_campaign=project_share'
        }) : '', m('a.w-hidden-main.w-hidden-medium.btn.btn-medium.btn-tweet.u-marginbottom-20[href="https://twitter.com/intent/tweet?text=I%20just%20supported%20the%20campaign%20' + args.project().name + '%20http://www.grasruts.com/' + args.project().permalink + '%3Fref%3Dtwitter%26utm_source%3Dtwitter.com%26utm_medium%3Dsocial%26utm_campaign%3Dproject_share"][target="_blank"]', [m('span.fa.fa-twitter'), ' Tweet'])
        // m('a.w-hidden-main.w-hidden-medium.btn.btn-medium[data-action="share/whatsapp/share"]', {
        //     href: `whatsapp://send?text=${encodeURIComponent(`https://www.grasruts.com/${args.project().permalink}/?ref=whatsapp&utm_source=whatsapp&utm_medium=social&utm_campaign=project_share`)}`
        // }, [m('span.fa.fa-whatsapp'), ' Whatsapp'])
        ]);
    }
};

var addressTag = {
    view: function view(ctrl, args) {
        var project = args.project,
            address = project().address || {
            state_acronym: '',
            city: ''
        };
        return !_$1.isNull(address) ? m('a.btn.btn-inline.btn-small.btn-transparent.link-hidden-light.u-marginbottom-10[href="/en/explore?pg_search=' + address.state_acronym + '"]', {
            onclick: h.analytics.event({
                cat: 'project_view',
                act: 'project_location_link',
                lbl: address.city + ' ' + address.state_acronym,
                project: project()
            })
        }, [m('span.fa.fa-map-marker'), '  ' + address.city + ', ' + address.state_acronym]) : '';
    }
};

var categoryTag = {
    view: function view(ctrl, args) {
        var project = args.project;

        return project ? m('a.btn.btn-inline.btn-small.btn-transparent.link-hidden-light[href="/explore#by_category_id/' + project().category_id + '"]', {
            onclick: h.analytics.event({
                cat: 'project_view',
                act: 'project_category_link',
                lbl: project().category_name,
                project: project()
            })
        }, [m('span.fa.fa-tag'), ' ', project().category_name]) : '';
    }
};

var projectHighlight = {
    controller: function controller() {
        return {
            displayShareBox: h.toggleProp(false, true)
        };
    },
    view: function view(ctrl, args) {
        var project = args.project;
        return m('#project-highlight', [project().video_embed_url ? m('.w-embed.w-video.project-video', {
            style: 'min-height: 240px;'
        }, [m('iframe.embedly-embed[itemprop="video"][src="' + project().video_embed_url + '"][frameborder="0"][allowFullScreen]')]) : m('.project-image', {
            style: 'background-image:url(\'' + (project().original_image || project().project_img) + '\');'
        }), m('.w-hidden-small.w-hidden-tiny', [m.component(addressTag, { project: project }), m.component(categoryTag, { project: project })]), m('.project-blurb', project().headline), m('.project-share.w-hidden-small.w-hidden-tiny', m('.u-marginbottom-30.u-text-center-small-only', [m('.w-inline-block.fontcolor-secondary.fontsize-smaller.u-marginright-20', 'Share:'), project().permalink ? m.component(facebookButton, {
            url: 'http://www.grasruts.com/' + project().permalink + '?ref=facebook&utm_source=facebook.com&utm_medium=social&utm_campaign=project_share'
        }) : '', project().permalink ? m.component(facebookButton, {
            messenger: true,
            url: 'http://www.grasruts.com/' + project().permalink + '?ref=facebook&utm_source=facebook.com&utm_medium=messenger&utm_campaign=project_share'
        }) : '', m('button#more-share.btn.btn-inline.btn-medium.btn-terciary', {
            style: {
                transition: 'all 0.5s ease 0s'
            },
            onclick: ctrl.displayShareBox.toggle
        }, ['···', ' More']), ctrl.displayShareBox() ? m(projectShareBox, {
            project: project,
            displayShareBox: ctrl.displayShareBox
        }) : '']))]);
    }
};

/**
 * window.c.ProjectMode component
 * A simple component that displays a badge with the current project mode
 * together with a description of the mode, shown inside a tooltip.
 * It receives a project as resource
 *
 * Example:
 *  view: {
 *      return m.component(c.ProjectMode, {project: project})
 *  }
 */

var projectMode = {
    view: function view(ctrl, args) {
        var project = args.project(),
            mode = project.mode,
            modeImgSrc = mode === 'aon' ? '/assets/aon-badge.png' : '/assets/flex-badge.png',
            modeTitle = mode === 'aon' ? 'All-or-nothing Campaign ' : 'Flexible Campaign ',
            goal = _$1.isNull(project.goal) ? 'not defined' : h.formatNumber(project.goal),
            buildTooltip = function buildTooltip(el) {
            return m.component(tooltip, {
                el: el,
                text: mode === 'aon' ? 'You will only receive the resources if you reach or exceed the goal until ' + h.momentify(project.zone_expires_at, 'DD/MM/YYYY') + '.' : 'The campaign manager will receive all the resources when he closes the campaign, even if s/he has not reached this goal.',
                width: 280
            });
        };

        return m('#' + mode + '.w-row', [m('.w-col.w-col-2.w-col-small-2.w-col-tiny-2', [!_$1.isEmpty(project) ? m('img[src="' + modeImgSrc + '"][width=\'30\']') : '']), m('.w-col.w-col-10.w-col-small-10.w-col-tiny-10', [m('.fontsize-base.fontweight-semibold', 'Goal Rs ' + h.selfOrEmpty(goal, '--')), m('.w-inline-block.fontsize-smallest._w-inline-block', [!_$1.isEmpty(project) ? modeTitle : '', buildTooltip('span.w-inline-block.tooltip-wrapper.fa.fa-question-circle.fontcolor-secondary')])])]);
    }
};

/**
 * window.c.ProjectReminder component
 * A component that displays a clickable project reminder element.
 * The component can be of two types: a 'link' or a 'button'
 *
 * Example:
 *  view: {
 *      return m.component(c.ProjectReminder, {project: project, type: 'button'})
 *  }
 */
var projectReminder = {
    controller: function controller(args) {
        var l = m.prop(false);
        var project = args.project,
            filterVM = postgrest$1.filtersVM({
            project_id: 'eq'
        }),
            storeReminderName = 'reminder',
            popNotification$$1 = m.prop(false),
            submitReminder = function submitReminder() {
            if (!h.getUser()) {
                h.storeAction(storeReminderName, project().project_id);
                return h.navigateToDevise();
            }
            var loaderOpts = project().in_reminder ? models.projectReminder.deleteOptions(filterVM.parameters()) : models.projectReminder.postOptions({
                project_id: project().project_id
            });
            l = postgrest$1.loaderWithToken(loaderOpts);

            l.load().then(function () {
                project().in_reminder = !project().in_reminder;

                if (project().in_reminder) {
                    popNotification$$1(true);
                    setTimeout(function () {
                        popNotification$$1(false);
                        m.redraw();
                    }, 5000);
                } else {
                    popNotification$$1(false);
                }
            });
        };

        if (h.callStoredAction(storeReminderName) == project().project_id) {
            submitReminder();
        }

        filterVM.project_id(project().project_id);

        return {
            l: l,
            submitReminder: submitReminder,
            popNotification: popNotification$$1
        };
    },
    view: function view(ctrl, args) {
        var mainClass = args.type === 'button' ? '' : '.u-text-center.u-marginbottom-30',
            buttonClass = args.type === 'button' ? 'w-button btn btn-terciary btn-no-border' : 'btn-link link-hidden fontsize-large',
            hideTextOnMobile = args.hideTextOnMobile || false,
            project = args.project,
            onclickFunc = h.analytics.event({ cat: 'project_view', act: 'project_floatingreminder_click', project: project() }, ctrl.submitReminder);

        return m('#project-reminder' + mainClass, [m('a.btn.btn-small.btn-terciary.w-hidden-main.w-hidden-medium[data-ix=\'popshare\'][href=\'#\']', {
            onclick: onclickFunc
        }, project().in_reminder ? [m('span.fa.fa-heart'), 'I dont love it'] : [m('span.fa.fa-heart-o'), ' I love it']), m('button[class="w-hidden-small w-hidden-tiny ' + buttonClass + ' ' + (project().in_reminder ? 'link-hidden-success' : 'fontcolor-secondary') + ' fontweight-semibold"]', {
            onclick: onclickFunc
        }, [ctrl.l() ? h.loader() : project().in_reminder ? m('span.fa.fa-heart') : m('span.fa.fa-heart-o')]), ctrl.popNotification() ? m.component(popNotification, {
            message: 'OK! We`ll email you a reminder 48 hours before the end of the campaign'
        }) : '']);
    }
};

/**
 * window.c.OwnerMessageContent component
 * Render project owner contact form
 *
 */
var ownerMessageContent = {
    controller: function controller(args) {
        var l = m.prop(false);
        var sendSuccess = m.prop(false),
            userDetails = args,
            submitDisabled = m.prop(false),

        // sets default values when user is not logged in
        user = h.getUser() || {
            name: '',
            email: ''
        },
            from_name = m.prop(userVM.displayName(user)),
            from_email = m.prop(user.email),
            content = m.prop('');

        var sendMessage = function sendMessage() {
            if (l()) {
                return false;
            }
            submitDisabled(true);
            content(content().split('\n').join('<br />'));
            var project = h.getCurrentProject();

            var loaderOpts = models.directMessage.postOptions({
                from_name: from_name(),
                from_email: from_email(),
                user_id: h.getUser().user_id,
                content: content(),
                project_id: project ? project.project_id : null,
                to_user_id: userDetails().id
            });

            l = postgrest$1.loaderWithToken(loaderOpts);

            l.load().then(sendSuccess(true));

            submitDisabled(false);
            return false;
        };

        return {
            sendMessage: sendMessage,
            submitDisabled: submitDisabled,
            sendSuccess: sendSuccess,
            userDetails: args,
            from_name: from_name,
            from_email: from_email,
            content: content,
            l: l
        };
    },
    view: function view(ctrl, args) {
        var successMessage = m('.modal-dialog-content.u-text-center', [m('.fa.fa-check-circle.fa-5x.text-success.u-marginbottom-40'), m('p.fontsize-large', 'Your message was successfully sent to ' + ctrl.userDetails().name + '. You will receive a copy in your email and you can follow the conversation there!')]),
            contactForm = [m('.modal-dialog-content', [m('.w-form', [m('form', {
            onsubmit: h.validate().submit([{
                prop: ctrl.from_name,
                rule: 'text'
            }, {
                prop: ctrl.from_email,
                rule: 'email'
            }, {
                prop: ctrl.content,
                rule: 'text'
            }], ctrl.sendMessage)
        }, [m('.w-row', [m('.w-col.w-col-6.w-sub-col', [m('label.fontsize-smaller', 'Your Name'), m('input.w-input.text-field[value=\'' + ctrl.from_name() + '\'][type=\'text\'][required=\'required\']', {
            onchange: m.withAttr('value', ctrl.from_name),
            class: h.validate().hasError(ctrl.from_name) ? 'error' : ''
        })]), m('.w-col.w-col-6', [m('label.fontsize-smaller', 'Your Email'), m('input.w-input.text-field[value=\'' + ctrl.from_email() + '\'][type=\'text\'][required=\'required\']', {
            onchange: m.withAttr('value', ctrl.from_email),
            class: h.validate().hasError(ctrl.from_email) ? 'error' : ''
        })])]), m('label', 'Message'), m('textarea.w-input.text-field.height-small[required=\'required\']', {
            onchange: m.withAttr('value', ctrl.content),
            class: h.validate().hasError(ctrl.content) ? 'error' : ''
        }), m('.u-marginbottom-10.fontsize-smallest.fontcolor-terciary', 'You will receive a copy of this message in your email.'), m('.w-row', h.validationErrors().length ? _$1.map(h.validationErrors(), function (errors) {
            return m('span.fontsize-smallest.text-error', [m('span.fa.fa-exclamation-triangle'), ' ' + errors.message, m('br')]);
        }) : ''), m('.modal-dialog-nav-bottom', m('.w-row', m('.w-col.w-col-6.w-col-push-3', !ctrl.l() ? m('input.w-button.btn.btn-large[type="submit"][value="Send Message"]', {
            disabled: ctrl.submitDisabled()
        }) : h.loader())))])])])];

        return m('div', [m('.modal-dialog-header', m('.fontsize-large.u-text-center', 'Send Message')), ctrl.sendSuccess() ? successMessage : contactForm]);
    }
};

/*
 * UserFollowBtn - Component
 * Handles with follow / unfollow actions to an user
 *
 * Example:
 * m.component(c.UserFollowBtn, {follow_id: 10, following: false})
 */

var UserFollowBtn = {
    controller: function controller(args) {
        var following = m.prop(args.following || false),
            followVM = postgrest$1.filtersVM({ follow_id: 'eq' }),
            loading = m.prop(false),
            hover = m.prop(false),
            userFollowInsert = models.userFollow.postOptions({
            follow_id: args.follow_id }),
            userFollowDelete = function () {
            followVM.follow_id(args.follow_id);

            return models.userFollow.deleteOptions(followVM.parameters());
        }(),
            follow = function follow() {
            var l = postgrest$1.loaderWithToken(userFollowInsert);
            loading(true);

            l.load().then(function () {
                following(true);
                loading(false);
            });
        },
            unfollow = function unfollow() {
            var l = postgrest$1.loaderWithToken(userFollowDelete);
            loading(true);

            l.load().then(function () {
                following(false);
                loading(false);
            });
        };

        return {
            following: following,
            follow: follow,
            unfollow: unfollow,
            loading: loading,
            hover: hover
        };
    },
    view: function view(ctrl, args) {
        if (h.userSignedIn() && h.getUserID() != args.follow_id) {
            var disableClass = args.disabledClass || '.w-button.btn.btn-medium.btn-terciary.u-margintop-20',
                enabledClass = args.enabledClass || '.w-button.btn.btn-medium.u-margintop-20';
            if (ctrl.loading()) {
                return h.loader();
            }
            if (ctrl.following()) {
                return m('a' + enabledClass, {
                    onclick: ctrl.unfollow,
                    onmouseover: function onmouseover() {
                        return ctrl.hover(true);
                    },
                    onmouseout: function onmouseout() {
                        return ctrl.hover(false);
                    }
                }, ctrl.hover() ? 'Unfollow' : 'Following');
            }
            return m('a' + disableClass, { onclick: ctrl.follow }, 'Follow');
        }
        return m('');
    }
};

var projectUserCard = {
    controller: function controller(args) {
        var project = args.project || m.prop({}),
            displayModal = h.toggleProp(false, true),
            storeId = 'message',
            sendMessage = function sendMessage() {
            if (!h.getUser()) {
                h.storeAction(storeId, project().project_id);
                return h.navigateToDevise();
            }

            displayModal(true);
        };

        if (h.callStoredAction(storeId) == project().project_id) {
            displayModal(true);
        }

        return {
            displayModal: displayModal,
            sendMessage: sendMessage
        };
    },
    view: function view(ctrl, args) {
        var project = args.project;
        var contactModalC = [ownerMessageContent, args.userDetails];
        var userDetail = args.userDetails();

        return m('#user-card', _$1.isEmpty(userDetail) ? 'Loading...' : m('.u-marginbottom-30.u-text-center-small-only', [ctrl.displayModal() ? m.component(modalBox, {
            displayModal: ctrl.displayModal,
            content: contactModalC
        }) : '', m('.w-row', [m('.w-col.w-col-4', [m('img.thumb.u-marginbottom-30.u-round[width="100"][itemprop="image"][src="' + userVM.displayImage(userDetail) + '"]')]), m('.w-col.w-col-8', [m('.fontsize-small.link-hidden.fontweight-semibold.u-marginbottom-10.lineheight-tight[itemprop="name"]', [m('a.link-hidden[href="/users/' + userDetail.id + '"]', { config: m.route,
            onclick: function onclick() {
                m.route('/users/' + userDetail.id, { user_id: userDetail.id });
                h.analytics.event({ cat: 'project_view', act: 'project_creator_link', lbl: userDetail.id, project: project() });
            } }, userVM.displayName(userDetail))]), m('.fontsize-smallest', [h.pluralize(userDetail.total_published_projects, ' Created', ' Created'), m.trust('&nbsp;&nbsp;|&nbsp;&nbsp;'), h.pluralize(userDetail.total_contributed_projects, ' Backed', ' Backed')]), m('ul.w-hidden-tiny.w-hidden-small.w-list-unstyled.fontsize-smaller.fontweight-semibold.u-margintop-20.u-marginbottom-20', [!_$1.isEmpty(userDetail.facebook_link) ? m('li', [m('a.link-hidden[itemprop="url"][href="' + userDetail.facebook_link + '"][target="_blank"]', { onclick: h.analytics.event({ cat: 'project_view', act: 'project_creator_fb', lbl: userDetail.facebook_link, project: project() }) }, 'Facebook Profile')]) : '', !_$1.isEmpty(userDetail.twitter_username) ? m('li', [m('a.link-hidden[itemprop="url"][href="https://twitter.com/' + userDetail.twitter_username + '"][target="_blank"]', { onclick: h.analytics.event({ cat: 'project_view', act: 'project_creator_twitter', lbl: userDetail.twitter_username, project: project() }) }, 'Twitter Profile')]) : '', _$1.map(userDetail.links, function (link) {
            var parsedLink = h.parseUrl(link.link);

            return !_$1.isEmpty(parsedLink.hostname) ? m('li', [m('a.link-hidden[itemprop="url"][href="' + link.link + '"][target="_blank"]', { onclick: h.analytics.event({ cat: 'project_view', act: 'project_creator_otherlinks', lbl: link.link, project: project() }) }, parsedLink.hostname)]) : '';
        })]), !_$1.isEmpty(userDetail) ? [m(UserFollowBtn, {
            enabledClass: 'a.w-button.btn.btn-terciary.btn-small..u-marginbottom-10',
            disabledClass: 'a.w-button.btn.btn-terciary.btn-small.u-marginbottom-10',
            follow_id: userDetail.id,
            following: userDetail.following_this_user }), m('a.w-button.btn.btn-terciary.btn-small[href=\'javascript:void(0);\']', { onclick: h.analytics.event({ cat: 'project_view', act: 'project_creator_sendmsg', lbl: userDetail.id, project: project() }, ctrl.sendMessage) }, 'Send Message')] : '', args.project().is_admin_role ? m('p', userDetail.email) : ''])])]));
    }
};

var I18nScope$19 = _$1.partial(h.i18nScope, 'projects.project_sidebar');

var projectSidebar = {
    controller: function controller(args) {
        var project = args.project,
            animateProgress = function animateProgress(el, isInitialized) {
            if (!isInitialized) {
                (function () {
                    var animation = void 0,
                        progress = 0,
                        pledged = 0,
                        contributors = 0;
                    var pledgedIncrement = project().pledged / project().progress,
                        contributorsIncrement = project().total_contributors / project().progress;

                    var progressBar = document.getElementById('progressBar'),
                        pledgedEl = document.getElementById('pledged'),
                        contributorsEl = document.getElementById('contributors'),
                        incrementProgress = function incrementProgress() {
                        if (progress <= parseInt(project().progress)) {
                            progressBar.style.width = progress + '%';
                            pledgedEl.innerText = 'Rs ' + h.formatNumber(pledged);
                            contributorsEl.innerText = parseInt(contributors) + ' people';
                            el.innerText = progress + '%';
                            pledged += pledgedIncrement;
                            contributors += contributorsIncrement;
                            progress += 1;
                        } else {
                            clearInterval(animation);
                        }
                    },
                        animate = function animate() {
                        animation = setInterval(incrementProgress, 28);
                    };

                    setTimeout(function () {
                        animate();
                    }, 1800);
                })();
            }
        };

        return {
            animateProgress: animateProgress,
            displayShareBox: h.toggleProp(false, true)
        };
    },
    view: function view(ctrl, args) {
        var project = args.project,
            elapsed = project().elapsed_time,
            remaining = project().remaining_time,
            displayCardClass = function displayCardClass() {
            var states = {
                waiting_funds: 'card-waiting',
                successful: 'card-success',
                failed: 'card-error',
                draft: 'card-dark',
                in_analysis: 'card-dark',
                approved: 'card-dark'
            };

            return states[project().state] ? 'card u-radius zindex-10 ' + states[project().state] : '';
        },
            displayStatusText = function displayStatusText() {
            var states = {
                approved: I18n$1.t('display_status.approved', I18nScope$19()),
                online: h.existy(project().zone_expires_at) && project().open_for_contributions ? I18n$1.t('display_status.online', I18nScope$19({ date: h.momentify(project().zone_expires_at) })) : '',
                failed: I18n$1.t('display_status.failed', I18nScope$19({ date: h.momentify(project().zone_expires_at), goal: 'Rs ' + h.formatNumber(project().goal, 2, 3) })),
                rejected: I18n$1.t('display_status.rejected', I18nScope$19()),
                in_analysis: I18n$1.t('display_status.in_analysis', I18nScope$19()),
                successful: I18n$1.t('display_status.successful', I18nScope$19({ date: h.momentify(project().zone_expires_at) })),
                waiting_funds: I18n$1.t('display_status.waiting_funds', I18nScope$19()),
                draft: I18n$1.t('display_status.draft', I18nScope$19())
            };

            return states[project().state];
        };

        return m('#project-sidebar.aside', [m('.project-stats', [m('.project-stats-inner', [m('.project-stats-info', [m('.u-marginbottom-20', [m('#pledged.fontsize-largest.fontweight-semibold.u-text-center-small-only', 'Rs ' + (project().pledged ? h.formatNumber(project().pledged) : '0')), m('.fontsize-small.u-text-center-small-only', [I18n$1.t('contributors_call', I18nScope$19()), m('span#contributors.fontweight-semibold', I18n$1.t('contributors_count', I18nScope$19({ count: project().total_contributors }))), !project().expires_at && elapsed ? ' in ' + I18n$1.t('datetime.distance_in_words.x_' + elapsed.unit, { count: elapsed.total }, I18nScope$19()) : ''])]), m('.meter', [m('#progressBar.meter-fill', {
            style: {
                width: project().progress + '%'
            }
        })]), m('.w-row.u-margintop-10', [m('.w-col.w-col-5.w-col-small-6.w-col-tiny-6', [m('.fontsize-small.fontweight-semibold.lineheight-tighter', (project().progress ? parseInt(project().progress) : '0') + '%')]), m('.w-col.w-col-7.w-col-small-6.w-col-tiny-6.w-clearfix', [m('.u-right.fontsize-small.lineheight-tighter', remaining && remaining.total ? [m('span.fontweight-semibold', remaining.total), I18n$1.t('remaining_time.' + remaining.unit, I18nScope$19({ count: remaining.total }))] : '')])])]), m('.w-row', [m.component(projectMode, {
            project: project
        })])]), project().open_for_contributions ? m('.back-project-btn-div', [m('.back-project--btn-row', [m('a#contribute_project_form.btn.btn-large.u-marginbottom-20[href="javascript:void(0);"]', {
            onclick: h.analytics.event({
                cat: 'contribution_create',
                act: 'contribution_button_click',
                project: project()
            }, function () {
                return h.navigateTo('/projects/' + project().project_id + '/contributions/new');
            })

        }, I18n$1.t('submit', I18nScope$19()))]), m('.back-project-btn-row-right', m.component(projectReminder, {
            project: project,
            type: 'link'
        }))]) : '', m('.friend-backed-card.project-page', [!_$1.isUndefined(project()) && project().contributed_by_friends ? m.component(projectFriends, { project: project(), wrapper: 'div' }) : '']), m('div[class="fontsize-smaller u-marginbottom-30 ' + displayCardClass() + '"]', displayStatusText())]), m('.project-share.w-hidden-main.w-hidden-medium', [m.component(addressTag, { project: project }), m.component(categoryTag, { project: project }), m('.u-marginbottom-30.u-text-center-small-only', m('button.btn.btn-inline.btn-medium.btn-terciary', {
            onclick: ctrl.displayShareBox.toggle
        }, 'Share this project')), ctrl.displayShareBox() ? m(projectShareBox, {
            project: project,
            displayShareBox: ctrl.displayShareBox
        }) : '']), m('.user-c', m.component(projectUserCard, {
            userDetails: args.userDetails,
            project: project
        }))]);
    }
};

var projectHeaderTitle = {
    view: function view(ctrl, args) {
        var project = args.project;

        return !_$1.isUndefined(project()) ? m('.w-section.page-header.u-text-center', [m('.w-container', [m('h1.fontsize-larger.fontweight-semibold.project-name[itemprop="name"]', h.selfOrEmpty(project().name || project().project_name)), m('h2.fontsize-base.lineheight-looser[itemprop="author"]', ['by ', project().user ? userVM.displayName(project().user) : project().owner_public_name ? project().owner_public_name : project().owner_name]), args.children])]) : m('div', '');
    }
};

var rewardReceiver = {
    controller: function controller() {
        var toggleDelivery = function toggleDelivery(projectId, contribution) {
            userVM.toggleDelivery(projectId, contribution).then(function () {
                var lastStatus = contribution.reward_sent_at ? 'delivered' : 'undelivered';
                contribution.delivery_status = contribution.delivery_status === 'received' ? lastStatus : 'received'; // so we don't have to reload the page
            });
        };

        return {
            toggleDelivery: toggleDelivery
        };
    },
    view: function view(ctrl, args) {
        var contribution = args.contribution;

        return contributionVM.canBeDelivered(contribution) ? m('.u-text-center.w-col.w-col-2', {
            onclick: function onclick() {
                return ctrl.toggleDelivery(contribution.project_id, contribution);
            }
        }, [m('.fontsize-smallest', m('a.checkbox-big' + (contribution.delivery_status === 'received' ? '.checkbox--selected.fa.fa-check.fa-lg' : ''), '')), m('.fontcolor-secondary.fontsize-smallest.lineheight-looser', 'Received?')]) : m('');
    }
};

var userContributionDetail = {
    controller: function controller(args) {
        var contribution = args.contribution,
            rewardDetails = args.rewardDetails,
            chosenReward = _$1.findWhere(rewardDetails(), {
            id: contribution.reward_id
        });

        return {
            contribution: contribution,
            chosenReward: chosenReward
        };
    },
    view: function view(ctrl, args) {
        var contribution = args.contribution;

        return m('.user-contribution-detail', [m('.w-col.w-col-4', [m('.fontsize-smallest.lineheight-tight.fontweight-semibold.u-marginbottom-10', 'Value of support:'), m('.fontsize-large', 'Rs' + contribution.value)]),
        // m('.w-col.w-col-3',
        //     m.component(paymentStatus, {
        //         item: contribution
        //     })
        // ),
        m('.w-col.w-col-6', [m('.fontsize-smaller.fontweight-semibold.u-marginbottom-10', 'Reward:'), m('.fontsize-smallest.lineheight-tight.u-marginbottom-20', !_$1.isUndefined(ctrl.chosenReward) ? [m('.fontsize-smallest.fontweight-semibold', ctrl.chosenReward.title), m('.fontsize-smallest.fontcolor-secondary', ctrl.chosenReward.description)] : 'No reward selected.'), m('.fontsize-smallest.lineheight-looser', !_$1.isUndefined(ctrl.chosenReward) ? [m('span.fontweight-semibold', 'Estimated delivery: '), h.momentify(ctrl.chosenReward.deliver_at, 'MMM/YYYY')] : ''), contributionVM.canBeDelivered(contribution) ? m('.fontsize-smallest.lineheight-looser', [m('span.fontweight-semibold', 'Delivery status: '), h.contributionStatusBadge(contribution)]) : '']), m(rewardReceiver, {
            contribution: contribution,
            wrapperClass: ''
        })]);
    }
};

var projectHeader = {
    controller: function controller(args) {
        var project = args.project,
            currentUser = h.getUser();

        if (h.isProjectPage() && currentUser && !_$1.isUndefined(project())) {
            contributionVM.getUserProjectContributions(currentUser.user_id, project().project_id, ['paid', 'refunded', 'pending_refund']).then(args.projectContributions);
        }

        return {
            projectContributions: args.projectContributions,
            showContributions: h.toggleProp(false, true)
        };
    },
    view: function view(ctrl, args) {
        var project = args.project,
            rewardDetails = args.rewardDetails;
        var hasContribution = !_$1.isEmpty(ctrl.projectContributions()) ? m('.card.card-terciary.u-radius.u-margintop-20', [m('.fontsize-small.u-text-center', [m('span.fa.fa-thumbs-up'), ' You are a supporter of this campaign! ', m('a.alt-link[href=\'javascript:void(0);\']', {
            onclick: ctrl.showContributions.toggle
        }, 'Details')]), ctrl.showContributions() ? m('.card.u-margintop-20', m('.w-row', _$1.map(ctrl.projectContributions(), function (contribution) {
            return m.component(userContributionDetail, {
                contribution: contribution,
                rewardDetails: rewardDetails
            });
        }))) : '']) : '';

        return !_$1.isUndefined(project()) ? m('#project-header', [m('.w-section.section-product.' + project().mode), m(projectHeaderTitle, {
            project: project,
            children: hasContribution
        }), m('.w-section.project-main', [m('.w-container', [m('.w-row.project-main', [m('.w-col.w-col-8.project-highlight', m.component(projectHighlight, {
            project: project
        })), m('.w-col.w-col-4', m.component(projectSidebar, {
            project: project,
            userDetails: args.userDetails
        }))])])])]) : m('');
    }
};

var projectTabs = {
    controller: function controller(args) {
        var isFixed = m.prop(false),
            originalPosition = m.prop(-1);

        var fixOnScroll = function fixOnScroll(el) {
            return function () {
                var viewportOffset = el.getBoundingClientRect();

                if (window.scrollY <= originalPosition()) {
                    originalPosition(-1);
                    isFixed(false);
                    m.redraw();
                }

                if (viewportOffset.top < 0 || window.scrollY > originalPosition() && originalPosition() > 0) {
                    if (!isFixed()) {
                        originalPosition(window.scrollY);
                        isFixed(true);
                        m.redraw();
                    }
                }
            };
        };

        var navDisplay = function navDisplay(el, isInitialized) {
            if (!isInitialized) {
                var fixNavBar = fixOnScroll(el);
                window.addEventListener('scroll', fixNavBar);
            }
        };

        return {
            navDisplay: navDisplay,
            isFixed: isFixed
        };
    },
    view: function view(ctrl, args) {
        var project = args.project,
            rewards = args.rewardDetails;

        var mainClass = !ctrl.isFixed() || project().is_owner_or_admin ? '.w-section.project-nav' : '.w-section.project-nav.project-nav-fixed';

        return m('nav-wrapper', project() ? [m(mainClass, {
            config: ctrl.navDisplay
        }, [m('.w-container', [m('.w-row', [m('.w-col.w-col-8', [!_$1.isEmpty(rewards()) ? m('a[id="rewards-link"][class="w-hidden-main w-hidden-medium dashboard-nav-link mf  ' + (h.hashMatch('#rewards') ? 'selected' : '') + '"][href="/' + project().permalink + '#rewards"]', {
            style: 'float: left;',
            onclick: h.analytics.event({
                cat: 'project_view', act: 'project_rewards_view', project: project() })
        }, 'Rewards') : m('a[id="rewards-link"][class="w-hidden-main w-hidden-medium dashboard-nav-link mf ' + (h.hashMatch('#contribution_suggestions') ? 'selected' : '') + '"][href="/' + project().permalink + '#contribution_suggestions"]', {
            style: 'float: left;',
            onclick: h.analytics.event({
                cat: 'project_view', act: 'project_contribsuggestions_view', project: project() })
        }, 'Suggested Values'), m('a[id="about-link"][class="dashboard-nav-link mf ' + (h.hashMatch('#about') || h.hashMatch('') ? 'selected' : '') + '"][href="#about"]', {
            style: 'float: left;',
            onclick: h.analytics.event({
                cat: 'project_view', act: 'project_about_view', project: project() })
        }, 'About'), m('a[id="posts-link"][class="dashboard-nav-link mf ' + (h.hashMatch('#posts') ? 'selected' : '') + '"][href="/' + project().permalink + '#posts"]', {
            style: 'float: left;',
            onclick: h.analytics.event({
                cat: 'project_view', act: 'project_posts_view', project: project() })
        }, ['News ', m('span.badge', project() ? project().posts_count : '')]), m('a[id="contributions-link"][class="w-hidden-small w-hidden-tiny dashboard-nav-link mf ' + (h.hashMatch('#contributions') ? 'selected' : '') + '"][href="#contributions"]', {
            style: 'float: left;',
            onclick: h.analytics.event({
                cat: 'project_view', act: 'project_contributions_view', project: project() })
        }, ['Supporters ', m('span.badge.w-hidden-small.w-hidden-tiny', project() ? project().total_contributors : '-')]), m('a[id="comments-link"][class="dashboard-nav-link mf ' + (h.hashMatch('#comments') ? 'selected' : '') + '"][href="#comments"]', {
            style: 'float: left;',
            onclick: h.analytics.event({
                cat: 'project_view', act: 'project_comments_view', project: project() })
        }, ['Comments ', project() ? m('fb:comments-count[href="http://www.grasruts.com/' + project().permalink + '"][class="badge project-fb-comment w-hidden-small w-hidden-tiny"][style="display: inline"]', m.trust('&nbsp;')) : '-'])]), project() ? m('.w-col.w-col-4.w-hidden-small.w-hidden-tiny', project().open_for_contributions ? [m('.w-row.project-nav-back-button', [m('.w-col.w-col-6.w-col-medium-8', [m('a.w-button.btn[href="/projects/' + project().project_id + '/contributions/new"]', {
            onclick: h.analytics.event({ cat: 'contribution_create', act: 'contribution_floatingbtn_click', project: project() })
        }, 'Support')]), m('.w-col.w-col-6.w-col-medium-4', {
            onclick: h.analytics.event({ cat: 'project_view', act: 'project_floatingreminder_click', project: project() })
        }, [m.component(projectReminder, { project: project, type: 'button', hideTextOnMobile: true })])])] : '') : ''])])]), ctrl.isFixed() && !project().is_owner_or_admin ? m('.w-section.project-nav') : ''] : '');
    }
};

var I18nScope$20 = _$1.partial(h.i18nScope, 'projects.contributions');

var projectRewardCard = {
    controller: function controller(args) {
        var storeKey = 'selectedReward',
            reward = args.reward,
            vm = rewardVM,
            descriptionExtended = m.prop(0),
            selectedDestination = m.prop(''),
            toggleDescriptionExtended = function toggleDescriptionExtended(rewardId) {
            if (descriptionExtended() === rewardId) {
                descriptionExtended(0);
            } else {
                descriptionExtended(rewardId);
            }

            return false;
        };

        var setInput = function setInput(el, isInitialized) {
            return !isInitialized ? el.focus() : false;
        };

        var selectDestination = function selectDestination(destination) {
            selectedDestination(destination);

            var shippingFee = vm.shippingFeeForCurrentReward(selectedDestination) ? Number(vm.shippingFeeForCurrentReward(selectedDestination).value) : 0;
            var rewardMinValue = Number(vm.selectedReward().minimum_value);
            vm.applyMask(shippingFee + rewardMinValue + ',00');
        };

        // @TODO: move submit, fee & value logic to VM
        var submitContribution = function submitContribution() {
            var valueFloat = h.monetaryToFloat(vm.contributionValue);
            var shippingFee = rewardVM.hasShippingOptions(vm.selectedReward()) ? vm.shippingFeeForCurrentReward(selectedDestination) : { value: 0 };

            if (!selectedDestination() && rewardVM.hasShippingOptions(vm.selectedReward())) {
                vm.error('Por favor, selecione uma opção de frete válida.');
            } else if (valueFloat < vm.selectedReward().minimum_value + shippingFee.value) {
                vm.error('O valor de apoio para essa recompensa deve ser de no m\xEDnimo R$' + vm.selectedReward().minimum_value + ' + frete R$' + h.formatNumber(shippingFee.value));
            } else {
                vm.error('');
                var valueUrl = window.encodeURIComponent(String(valueFloat).replace('.', ','));
                h.navigateTo('/projects/' + projectVM.currentProject().project_id + '/contributions/fallback_create?contribution%5Breward_id%5D=' + vm.selectedReward().id + '&contribution%5Bvalue%5D=' + valueUrl + '&contribution%5Bshipping_fee_id%5D=' + shippingFee.id);
            }

            return false;
        };
        var isRewardOpened = function isRewardOpened() {
            return vm.selectedReward().id === reward.id;
        };
        var isRewardDescriptionExtended = function isRewardDescriptionExtended() {
            return descriptionExtended() === reward.id;
        };
        var isLongDescription = function isLongDescription() {
            return reward.description.length > 110;
        };
        if (h.getStoredObject(storeKey)) {
            var _h$getStoredObject = h.getStoredObject(storeKey),
                value = _h$getStoredObject.value;

            h.removeStoredObject(storeKey);
            vm.selectedReward(reward);
            vm.contributionValue(h.applyMonetaryMask(value + ',00'));
            submitContribution();
        }

        vm.getStates();

        return {
            setInput: setInput,
            reward: reward,
            submitContribution: submitContribution,
            toggleDescriptionExtended: toggleDescriptionExtended,
            isRewardOpened: isRewardOpened,
            isLongDescription: isLongDescription,
            isRewardDescriptionExtended: isRewardDescriptionExtended,
            selectDestination: selectDestination,
            selectedDestination: selectedDestination,
            error: vm.error,
            applyMask: vm.applyMask,
            selectReward: vm.selectReward,
            locationOptions: vm.locationOptions,
            contributionValue: vm.contributionValue
        };
    },
    view: function view(ctrl, args) {
        // FIXME: MISSING ADJUSTS
        // - add draft admin modifications
        var reward = ctrl.reward,
            project = args.project;
        return m('div[class="' + (h.rewardSouldOut(reward) ? 'card-gone' : 'card-reward ' + (project.open_for_contributions ? 'clickable' : '')) + ' card card-secondary u-marginbottom-10"]', {
            onclick: h.analytics.event({
                cat: 'contribution_create',
                act: 'contribution_reward_click',
                lbl: reward.minimum_value,
                project: project,
                extraData: {
                    reward_id: reward.id,
                    reward_value: reward.minimum_value
                }
            }, ctrl.selectReward(reward)),
            config: ctrl.isRewardOpened(reward) ? h.scrollTo() : Function.prototype
        }, [
        // reward.minimum_value >= 100 ? m('.tag-circle-installment', [
        //     m('.fontsize-smallest.fontweight-semibold.lineheight-tightest', '33x'),
        //     m('.fontsize-mini.lineheight-tightest', 's/ juros')
        // ]) : '',
        m('.u-marginbottom-20', [m('.fontsize-base.fontweight-semibold', 'For Rs ' + h.formatNumber(reward.minimum_value))]), m('.fontsize-smaller.fontweight-semibold', reward.title), m('.fontsize-smaller.reward-description' + (h.rewardSouldOut(reward) ? '' : '.fontcolor-secondary'), {
            class: ctrl.isLongDescription() ? ctrl.isRewardOpened() ? 'opened ' + (ctrl.isRewardDescriptionExtended() ? 'extended' : '') : '' : 'opened extended'
        }, m.trust(h.simpleFormat(h.strip(reward.description)))), ctrl.isLongDescription() && ctrl.isRewardOpened() ? m('a[href="javascript:void(0);"].alt-link.fontsize-smallest.gray.link-more.u-marginbottom-20', {
            onclick: function onclick() {
                return ctrl.toggleDescriptionExtended(reward.id);
            }
        }, [ctrl.isRewardDescriptionExtended() ? 'less ' : 'more ', m('span.fa.fa-angle-down', {
            class: ctrl.isRewardDescriptionExtended() ? 'reversed' : ''
        })]) : '', m('.u-marginbottom-20.w-row', [m('.w-col.w-col-6', !_$1.isEmpty(reward.deliver_at) ? [m('.fontcolor-secondary.fontsize-smallest', m('span', 'Estimated delivery time:')), m('.fontsize-smallest', h.momentify(reward.deliver_at, 'MMM/YYYY'))] : ''), m('.w-col.w-col-6', rewardVM.hasShippingOptions(reward) || reward.shipping_options === 'presential' ? [m('.fontcolor-secondary.fontsize-smallest', m('span', 'Send:')), m('.fontsize-smallest', I18n$1.t('shipping_options.' + reward.shipping_options, I18nScope$20()))] : '')]), reward.maximum_contributions > 0 ? [h.rewardSouldOut(reward) ? m('.u-margintop-10', [m('span.badge.badge-gone.fontsize-smaller', 'Out of stock')]) : m('.u-margintop-10', [m('span.badge.badge-attention.fontsize-smaller', [m('span.fontweight-bold', 'Limited'), project.open_for_contributions ? ' (' + h.rewardRemaning(reward) + ' in ' + reward.maximum_contributions + ' Available)' : ''])])] : '', m('.fontcolor-secondary.fontsize-smallest.fontweight-semibold', h.pluralize(reward.paid_count, ' support', ' supports')), reward.waiting_payment_count > 0 ? m('.maximum_contributions.in_time_to_confirm.clearfix', [m('.pending.fontsize-smallest.fontcolor-secondary', h.pluralize(reward.waiting_payment_count, ' Support in confirmation period', ' Support in confirmatory terms.'))]) : '', project.open_for_contributions && !h.rewardSouldOut(reward) ? [ctrl.isRewardOpened() ? m('.w-form', [m('form.u-margintop-30', {
            onsubmit: ctrl.submitContribution
        }, [m('.divider.u-marginbottom-20'), rewardVM.hasShippingOptions(reward) ? m('div', [m('.fontcolor-secondary.u-marginbottom-10', 'Delivery place'), m('select.positive.text-field.w-select', {
            onchange: m.withAttr('value', ctrl.selectDestination),
            value: ctrl.selectedDestination()
        }, _$1.map(ctrl.locationOptions(reward, ctrl.selectedDestination), function (option) {
            return m('option[value="' + option.value + '"]', { selected: option.value === ctrl.selectedDestination() }, [option.name + ' ', option.value != '' ? '+R$' + option.fee : null]);
        }))]) : '',
        // m('.fontcolor-secondary.u-marginbottom-10',
        //     'Value of support'
        // ),
        // m('.w-row.u-marginbottom-20', [
        //     m('.w-col.w-col-3.w-col-small-3.w-col-tiny-3',
        //         m('.back-reward-input-reward.placeholder',
        //             'Rs'
        //         )
        //     ),
        //     m('.w-col.w-col-9.w-col-small-9.w-col-tiny-9',
        //         m('input.w-input.back-reward-input-reward[type="tel"]', {
        //             config: ctrl.setInput,
        //             onkeyup: m.withAttr('value', ctrl.applyMask),
        //             value: ctrl.contributionValue()
        //         })
        //     )
        // ]),
        m('input.w-button.btn.btn-medium[type="submit"][value="Continue >"]'), ctrl.error().length > 0 ? m('.text-error', [m('br'), m('span.fa.fa-exclamation-triangle'), ' ' + ctrl.error()]) : ''])]) : ''] : '']);
    }
};

var projectRewardList = {
    view: function view(ctrl, args) {
        var project = args.project() || {
            open_for_contributions: false
        };
        return m('#rewards.reward.u-marginbottom-30', _$1.map(_$1.sortBy(args.rewardDetails(), function (reward) {
            return Number(reward.row_order);
        }), function (reward) {
            return m(projectRewardCard, { reward: reward, project: project });
        }));
    }
};

/**
 * window.c.ProjectSuggestedContributions component
 * A Project-show page helper to show suggested amounts of contributions
 *
 * Example of use:
 * view: () => {
 *   ...
 *   m.component(c.ProjectSuggestedContributions, {project: project})
 *   ...
 * }
 */
var projectSuggestedContributions = {
    view: function view(ctrl, args) {
        var project = args.project();

        var suggestionUrl = function suggestionUrl(amount) {
            return '/projects/' + project.project_id + '/contributions/new?amount=' + amount;
        },
            suggestedValues = [100, 500, 1000, 2000];
        return m('');
        // return m('#suggestions', _.map(suggestedValues, amount => project ? m(`a[href="${suggestionUrl(amount)}"].card-reward.card-big.card-secondary.u-marginbottom-20`, [
        //     m('.fontsize-larger', `Rs ${amount}`)
        // ]) : ''));
    }
};

var projectContributions$1 = {
    controller: function controller(args) {
        var contributionsPerDay = m.prop([]),
            listVM = postgrest$1.paginationVM(models.contributor),
            filterStats = postgrest$1.filtersVM({
            project_id: 'eq'
        }),
            filterVM = postgrest$1.filtersVM({
            project_id: 'eq'
        }),
            groupedCollection = function groupedCollection() {
            var collection = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

            var grouped = [[]],
                group = 0;

            _$1.map(collection, function (item, index) {
                if (grouped[group].length >= 3) {
                    group += 1;
                    grouped[group] = [];
                }

                grouped[group].push(item);
            });

            return grouped;
        },
            contributionsStats = m.prop({});

        filterVM.project_id(args.project().project_id);
        filterStats.project_id(args.project().project_id);

        if (!listVM.collection().length) {
            listVM.firstPage(filterVM.parameters());
        }
        // TODO: Abstract table fetch and contruction logic to contributions-vm to avoid insights.js duplicated code.
        var lContributionsPerDay = postgrest$1.loader(models.projectContributionsPerDay.getRowOptions(filterStats.parameters()));
        lContributionsPerDay.load().then(contributionsPerDay);

        var contributionsPerLocationTable = [['state', 'Backed', 'Rs backed (% Of total)']];
        var buildPerLocationTable = function buildPerLocationTable(contributions) {
            return !_$1.isEmpty(contributions) ? _$1.map(_$1.first(contributions).source, function (contribution) {
                var column = [];

                column.push(contribution.state_acronym || 'Outro/other');
                column.push(contribution.total_contributions);
                column.push([contribution.total_contributed, [// Adding row with custom comparator => read project-data-table description
                m('input[type="hidden"][value="' + contribution.total_contributed + '"'), 'Rs ', h.formatNumber(contribution.total_contributed, 2, 3), m('span.w-hidden-small.w-hidden-tiny', ' (' + contribution.total_on_percentage.toFixed(2) + '%)')]]);
                return contributionsPerLocationTable.push(column);
            }) : [];
        };

        var lContributionsPerLocation = postgrest$1.loader(models.projectContributionsPerLocation.getRowOptions(filterStats.parameters()));
        lContributionsPerLocation.load().then(buildPerLocationTable);

        var lContributionsStats = postgrest$1.loader(models.projectContributiorsStat.getRowOptions(filterStats.parameters()));
        lContributionsStats.load().then(function (data) {
            return contributionsStats(_$1.first(data));
        });

        return {
            listVM: listVM,
            filterVM: filterVM,
            groupedCollection: groupedCollection,
            lContributionsStats: lContributionsStats,
            contributionsPerLocationTable: contributionsPerLocationTable,
            lContributionsPerLocation: lContributionsPerLocation,
            contributionsPerDay: contributionsPerDay,
            lContributionsPerDay: lContributionsPerDay,
            contributionsStats: contributionsStats
        };
    },
    view: function view(ctrl, args) {
        var list = ctrl.listVM,
            stats = ctrl.contributionsStats(),
            groupedCollection = ctrl.groupedCollection(list.collection());

        return m('#project_contributions', m('#contributions_top', [m('.section.w-section', m('.w-container', m('.w-row', ctrl.lContributionsStats() ? h.loader() : !_$1.isEmpty(stats) ? [m('.u-marginbottom-20.u-text-center-small-only.w-col.w-col-6', [m('.fontsize-megajumbo', stats.total), m('.fontsize-large', 'People support this campaign')]), m('.w-col.w-col-6', m('.card.card-terciary.u-radius', m('.w-row', [m('.u-marginbottom-20.w-col.w-col-6.w-col-small-6', [m('.fontweight-semibold.u-marginbottom-10', 'New supporters'), m('.fontsize-largest.u-marginbottom-10', Math.floor(stats.new_percent) + '%'), m('.fontsize-smallest', 'Supporters who had never supported a campaign in Grasruts')]), m('.w-col.w-col-6.w-col-small-6', [m('.divider.u-marginbottom-20.w-hidden-main.w-hidden-medium.w-hidden-small'), m('.fontweight-semibold.u-marginbottom-10', 'Recurring supporters'), m('.fontsize-largest.u-marginbottom-10', Math.ceil(stats.returning_percent) + '%'), m('.fontsize-smallest', 'Supporters who had already supported a campaign in Grasruts')])])))] : ''))), m('.divider.w-section'), m('.section.w-section', m('.w-container', [m('.fontsize-large.fontweight-semibold.u-marginbottom-40.u-text-center', 'Supporters'), m('.project-contributions.w-clearfix', _$1.map(groupedCollection, function (group, idx) {
            return m('.w-row', _$1.map(group, function (contribution) {
                return m('.project-contribution-item.w-col.w-col-4', [
                // here new card
                m('.card.card-backer.u-marginbottom-20.u-radius.u-text-center', [m('a[href="/users/' + contribution.user_id + '"][style="display: block;"]', {
                    onclick: h.analytics.event({
                        cat: 'project_view',
                        act: 'project_backer_link',
                        lbl: contribution.user_id,
                        project: args.project()
                    })
                }, [m('img.thumb.u-marginbottom-10.u-round[src="' + (!_$1.isEmpty(contribution.data.profile_img_thumbnail) ? contribution.data.profile_img_thumbnail : '/assets/catarse_bootstrap/user.jpg') + '"]')]), m('a.fontsize-base.fontweight-semibold.lineheigh-tight.link-hidden-dark[href="/users/' + contribution.user_id + '"]', {
                    onclick: h.analytics.event({
                        cat: 'project_view',
                        act: 'project_backer_link',
                        lbl: contribution.user_id,
                        project: args.project()
                    })
                }, userVM.displayName(contribution.data)), m('.fontcolor-secondary.fontsize-smallest.u-marginbottom-10', h.selfOrEmpty(contribution.data.city) + ', ' + h.selfOrEmpty(contribution.data.state)), m('.fontsize-smaller', [m('span.fontweight-semibold', contribution.data.total_contributed_projects), ' Supported  |  ', m('span.fontweight-semibold', contribution.data.total_published_projects), ' Created']), m('.btn-bottom-card.w-row', [m('.w-col.w-col-3.w-col-small-4.w-col-tiny-3'), m('.w-col.w-col-6.w-col-small-4.w-col-tiny-6', [m(UserFollowBtn, { follow_id: contribution.user_id, following: contribution.is_follow })]), m('.w-col.w-col-3.w-col-small-4.w-col-tiny-3')])])
                // new card
                ]);
            }));
        })), m('.w-row.u-marginbottom-40.u-margintop-20', [m('.w-col.w-col-2.w-col-push-5', [!list.isLoading() ? list.isLastPage() ? '' : m('button#load-more.btn.btn-medium.btn-terciary', {
            onclick: list.nextPage
        }, 'Load more') : h.loader()])])]))]), m('.before-footer.bg-gray.section.w-section', m('.w-container', [m('.w-row.u-marginbottom-60', [m('.w-col.w-col-12.u-text-center', {
            style: {
                'min-height': '300px'
            }
        }, [!ctrl.lContributionsPerDay() ? m.component(projectDataChart, {
            collection: ctrl.contributionsPerDay,
            label: 'Rs collected per day',
            dataKey: 'total_amount',
            xAxis: function xAxis(item) {
                return h.momentify(item.paid_at);
            },
            emptyState: 'Unaccounted support'
        }) : h.loader()])])
        // m('.w-row',
        //   m('.w-col.w-col-12.u-text-center', [
        //       m('.fontweight-semibold.u-marginbottom-10.fontsize-large.u-text-center', 'Where does the support come from?'),
        //       (!ctrl.lContributionsPerLocation() ? !_.isEmpty(_.rest(ctrl.contributionsPerLocationTable)) ? m.component(projectDataTable, {
        //           table: ctrl.contributionsPerLocationTable,
        //           defaultSortIndex: -2
        //       }) : '' : h.loader())
        //   ])
        //  )
        ])));
    }
};

/**
 * window.c.projectReport component
 * Render project report form
 *
 */
var projectReport = {
    controller: function controller(args) {
        var displayForm = h.toggleProp(false, true),
            sendSuccess = m.prop(false),
            submitDisabled = m.prop(false),
            user = h.getUser() || {},
            email = m.prop(user.email),
            details = m.prop(''),
            reason = m.prop(''),
            l = m.prop(false),
            storeReport = 'report',
            project = projectVM.currentProject(),
            hasPendingAction = project && h.callStoredAction(storeReport) == project.project_id,
            checkLogin = function checkLogin() {
            if (!_.isEmpty(user)) {
                displayForm.toggle();
            } else {
                h.storeAction(storeReport, project.project_id);
                return h.navigateToDevise();
            }
        },
            sendReport = function sendReport() {
            submitDisabled(true);
            var loaderOpts = models.projectReport.postOptions({
                email: email(),
                details: details(),
                reason: reason(),
                project_id: project.project_id
            });
            l = postgrest$1.loaderWithToken(loaderOpts);

            l.load().then(sendSuccess(true));
            submitDisabled(false);
            return false;
        },
            checkScroll = function checkScroll(el, isInit) {
            if (!isInit && hasPendingAction) {
                h.animateScrollTo(el);
            }
        };

        if (!_.isEmpty(user) && hasPendingAction) {
            displayForm(true);
        }

        return {
            checkScroll: checkScroll,
            checkLogin: checkLogin,
            displayForm: displayForm,
            sendSuccess: sendSuccess,
            submitDisabled: submitDisabled,
            sendReport: sendReport,
            user: user,
            email: email,
            details: details,
            reason: reason
        };
    },
    view: function view(ctrl, args) {
        var user = ctrl.user;

        return m('.card.card-terciary.u-radius', [m('.fontsize-small.u-marginbottom-20', ['This campaign disrespects', m.trust('&nbsp;'), m('a.alt-link[href=\'http://www.grasruts.com/rules\'][target=\'_blank\']', ' our rules? ')]), ctrl.sendSuccess() ? m('.w-form', m('p', 'Thank you! Your report has been received.')) : [m('.a.w-button.btn.btn-medium.btn-terciary.btn-inline[href=\'javascript:void(0);\']', { onclick: ctrl.checkLogin }, 'Report this campaign'), ctrl.displayForm() ? m('#report-form.u-margintop-30', m('.w-form', m('form', { onsubmit: ctrl.sendReport, config: ctrl.checkScroll }, [m('.fontsize-small.fontweight-semibold.u-marginbottom-10', 'Why are you denouncing this campaign?'), m('select.w-select.text-field.positive[required=\'required\']', { onchange: m.withAttr('value', ctrl.reason) }, [m('option[value=\'\']', 'Select a reason'), m('option[value=\'Intellectual Property infringement\']', 'Intellectual Property infringement'), m('option[value=\'Slander, libel, defamation or discrimination\']', 'Slander, libel, defamation or discrimination'), m('option[value=\'Prohibited campaign scope\']', 'Prohibited campaign scope'), m('option[value=\'Forbidden Rewards\']', 'Forbidden Rewards'), m('option[value=\'Explicit free sex scenes\']', 'Explicit free sex scenes'), m('option[value=\'SPAM abuse\']', 'SPAM abuse'), m('option[value=\'Others\']', 'Others')]), m('textarea.w-input.text-field.positive.u-marginbottom-30', { placeholder: 'Please give more details to help us identify the problem', onchange: m.withAttr('value', ctrl.details) }), m('input.w-button.btn.btn-medium.btn-inline.btn-dark[type=\'submit\'][value=\'Send Complaint\']', { disabled: ctrl.submitDisabled() })]))) : '']]);
    }
};

var projectAbout = {
    view: function view(ctrl, args) {
        var project = args.project() || {},
            onlineDays = function onlineDays() {
            var diff = moment(project.zone_online_date).diff(moment(project.zone_expires_at)),
                duration = moment.duration(diff);

            return -Math.ceil(duration.asDays());
        };
        var fundingPeriod = function fundingPeriod() {
            return project.is_published && h.existy(project.zone_expires_at) ? m('.funding-period', [m('.fontsize-small.fontweight-semibold.u-text-center-small-only', 'Campaign period'), m('.fontsize-small.u-text-center-small-only', h.momentify(project.zone_online_date) + ' - ' + h.momentify(project.zone_expires_at) + ' (' + onlineDays() + ' days)')]) : '';
        };

        return m('#project-about', [m('.project-about.w-col.w-col-8', {
            config: h.UIHelper()
        }, [m('p.fontsize-base', [m('strong', 'The Campaign')]), m('.fontsize-base[itemprop="about"]', m.trust(h.selfOrEmpty(project.about_html, '...'))), project.budget ? [m('p.fontsize-base.fontweight-semibold', 'Budget'), m('p.fontsize-base', m.trust(project.budget))] : '', m.component(projectReport)]), m('.w-col.w-col-4.w-hidden-small.w-hidden-tiny', !_$1.isEmpty(args.rewardDetails()) ? [m('.fontsize-base.fontweight-semibold.u-marginbottom-30', 'Rewards'), m.component(projectRewardList, {
            project: args.project,
            rewardDetails: args.rewardDetails
        }), fundingPeriod()] : [
        // m('.fontsize-base.fontweight-semibold.u-marginbottom-30', 'Suggestions for support'),
        // m.component(projectSuggestedContributions, {project: args.project}),
        fundingPeriod()])]);
    }
};

var projectComments = {
    controller: function controller() {
        var loadComments = function loadComments(el, isInitialized) {
            return function (el, isInitialized) {
                if (isInitialized) {
                    return;
                }
                h.fbParse();
            };
        };

        return { loadComments: loadComments };
    },
    view: function view(ctrl, args) {
        var project = args.project();
        return m('.w-row', [m('.w-col.w-col-7', m('.fb-comments[data-href="http://www.grasruts.com/' + project.permalink + '"][data-num-posts=50][data-width="610"]', { config: ctrl.loadComments() })), m('.w-col.w-col-5', m.component(projectReport))]);
    }
};

var I18nScope$21 = _$1.partial(h.i18nScope, 'projects.posts');

var projectPosts = {
    controller: function controller(args) {
        var listVM = postgrest$1.paginationVM(models.projectPostDetail),
            filterVM = postgrest$1.filtersVM({
            project_id: 'eq',
            id: 'eq'
        });
        var scrollTo = function scrollTo(el, isInit) {
            if (!isInit) {
                h.animateScrollTo(el);
            }
        };

        filterVM.project_id(args.project().project_id);

        if (_$1.isNumber(args.post_id)) {
            filterVM.id(args.post_id);
        }

        if (!listVM.collection().length) {
            listVM.firstPage(filterVM.parameters());
        }

        return {
            listVM: listVM,
            filterVM: filterVM,
            scrollTo: scrollTo
        };
    },
    view: function view(ctrl, args) {
        var list = ctrl.listVM,
            project = args.project() || {};

        return m('#posts.project-posts.w-section', { config: ctrl.scrollTo }, [m('.w-container.u-margintop-20', [project.is_owner_or_admin ? [!list.isLoading() ? _$1.isEmpty(list.collection()) ? m('.w-hidden-small.w-hidden-tiny', [m('.fontsize-base.u-marginbottom-30.u-margintop-20', 'All news published in Grasruts is sent directly to the email of those who have already supported your campaign and is also available for viewing on the website. You can choose to leave it public, or visible only to your supporters here on this tab.')]) : '' : '', m('.w-row.u-marginbottom-20', [m('.w-col.w-col-4.w-col-push-4', [m('a.btn.btn-edit.btn-small[href=\'/en/projects/' + project.project_id + '/posts\']', 'Write News')])])] : '', _$1.map(list.collection(), function (post) {
            return m('.w-row', [m('.w-col.w-col-1'), m('.w-col.w-col-10', [m('.post', [m('.u-marginbottom-60 .w-clearfix', [m('.fontsize-small.fontcolor-secondary.u-text-center', h.momentify(post.created_at)), m('p.fontweight-semibold.fontsize-larger.u-text-center.u-marginbottom-30', [m('a.link-hidden[href="/projects/' + post.project_id + '/posts/' + post.id + '#posts"]', post.title)]), !_$1.isEmpty(post.comment_html) ? m('.fontsize-base', m.trust(post.comment_html)) : m('.fontsize-base', 'Exclusive post for supporters.')]), m('.divider.u-marginbottom-60')])]), m('.w-col.w-col-1')]);
        }), m('.w-row', [!_$1.isUndefined(args.post_id) ? '' : !list.isLoading() ? list.collection().length === 0 && args.projectContributions().length === 0 ? !project.is_owner_or_admin ? m('.w-col.w-col-10.w-col-push-1', m('p.fontsize-base', m.trust(I18n$1.t('empty', I18nScope$21({
            project_user_name: args.userDetails().name,
            project_id: project.project_id
        }))))) : '' : m('.w-col.w-col-2.w-col-push-5', list.isLastPage() ? list.collection().length === 0 ? 'No news.' : '' : m('button#load-more.btn.btn-medium.btn-terciary', {
            onclick: list.nextPage
        }, 'Load more')) : m('.w-col.w-col-2.w-col-push-5', h.loader())])])]);
    }
};

var projectMain = {
    controller: function controller(args) {
        var hash = m.prop(window.location.hash),
            displayTabContent = function displayTabContent(project) {
            var c_opts = {
                project: project,
                post_id: args.post_id
            },
                tabs = {
                '#rewards': m('.w-col.w-col-12', m.component(projectRewardList, _$1.extend({}, {
                    rewardDetails: args.rewardDetails
                }, c_opts))),
                '#contribution_suggestions': m.component(projectSuggestedContributions, c_opts),
                '#contributions': m.component(projectContributions$1, c_opts),
                '#about': m.component(projectAbout, _$1.extend({}, {
                    rewardDetails: args.rewardDetails
                }, c_opts)),
                '#comments': m.component(projectComments, c_opts),
                '#posts': m.component(projectPosts, _$1.extend({}, {
                    projectContributions: args.projectContributions,
                    userDetails: args.userDetails
                }, c_opts))
            };

            if (_$1.isNumber(args.post_id) && !window.location.hash) {
                window.location.hash = 'posts';
            }

            hash(window.location.hash);

            if (_$1.isEmpty(hash()) || hash() === '#_=_' || hash() === '#preview') {
                return tabs['#about'];
            }

            return tabs[hash()];
        };

        h.redrawHashChange();

        return {
            displayTabContent: displayTabContent,
            hash: hash
        };
    },
    view: function view(ctrl, args) {
        return m('section.section[itemtype="http://schema.org/CreativeWork"]', [m('' + (ctrl.hash() !== '#contributions' ? '.w-container' : '.about-tab-content'), [m('.w-row', args.project() ? ctrl.displayTabContent(args.project) : h.loader())])]);
    }
};

var projectsShow = {
    controller: function controller(args) {
        var project_id = args.project_id,
            project_user_id = args.project_user_id;


        if (project_id && !_$1.isNaN(Number(project_id))) {
            projectVM.init(project_id, project_user_id);
        } else {
            projectVM.getCurrentProject();
        }
        try {
            h.analytics.windowScroll({ cat: 'project_view', act: 'project_page_scroll', project: project_id ? { id: project_id, user_id: project_user_id } : null });
            h.analytics.event({ cat: 'project_view', act: 'project_page_view', project: project_id ? { id: project_id, user_id: project_user_id } : null }).call();
        } catch (e) {
            console.error(e);
        }

        return projectVM;
    },
    view: function view(ctrl, args) {
        var project = ctrl.currentProject;
        return m('.project-show', {
            config: ctrl.setProjectPageTitle()
        }, project() ? [m.component(projectHeader, {
            project: project,
            rewardDetails: ctrl.rewardDetails,
            userDetails: ctrl.userDetails,
            projectContributions: ctrl.projectContributions
        }), m.component(projectTabs, {
            project: project,
            rewardDetails: ctrl.rewardDetails
        }), m.component(projectMain, {
            project: project,
            post_id: args.post_id,
            rewardDetails: ctrl.rewardDetails,
            userDetails: ctrl.userDetails,
            projectContributions: ctrl.projectContributions
        }), project() && project().is_owner_or_admin ? m.component(projectDashboardMenu, {
            project: project
        }) : ''] : h.loader());
    }
};

var I18nScope$23 = _$1.partial(h.i18nScope, 'projects.contributions.edit.errors');
var I18nIntScope = _$1.partial(h.i18nScope, 'projects.contributions.edit_international.errors');

var paymentVM = function paymentVM() {
    var pagarme = m.prop({}),
        submissionError = m.prop(false),
        isLoading = m.prop(false);

    var setCsrfToken = function setCsrfToken(xhr) {
        if (h.authenticityToken()) {
            xhr.setRequestHeader('X-CSRF-Token', h.authenticityToken());
        }
    };

    var fields = {
        completeName: m.prop(''),
        anonymous: m.prop(),
        countries: m.prop(),
        userCountryId: m.prop(),
        zipCode: m.prop(''),
        street: m.prop(''),
        number: m.prop(''),
        addressComplement: m.prop(''),
        neighbourhood: m.prop(''),
        city: m.prop(''),
        states: m.prop([]),
        userState: m.prop(),
        ownerDocument: m.prop(''),
        phone: m.prop(''),
        errors: m.prop([])
    };

    var creditCardFields = {
        name: m.prop(''),
        number: m.prop(''),
        expMonth: m.prop(''),
        expYear: m.prop(''),
        save: m.prop(false),
        cvv: m.prop(''),
        errors: m.prop([]),
        cardOwnerDocument: m.prop('')
    };

    var populateForm = function populateForm(fetchedData) {
        var data = _$1.first(fetchedData) || { address: {} },
            defaultCountry = fields.countries() ? _$1.findWhere(fields.countries(), { name: 'Nepal' }).id : null,
            countryId = data.address && data.address.country_id || defaultCountry;

        if (!_$1.isEmpty(data.address)) {
            fields.city(data.address.city);
            fields.zipCode(data.address.zipcode);
            fields.street(data.address.street);
            fields.number(data.address.number);
            fields.addressComplement(data.address.complement);
            fields.userState(data.address.state);
            fields.neighbourhood(data.address.neighbourhood);
            fields.phone(data.address.phonenumber);
        }

        fields.completeName(data.name);
        fields.ownerDocument(data.owner_document);
        fields.userCountryId(countryId);

        creditCardFields.cardOwnerDocument(data.owner_document);
    };

    var expMonthOptions = function expMonthOptions() {
        return [[null, 'Month'], [1, '01 - January'], [2, '02 - Feburary'], [3, '03 - March'], [4, '04 - April'], [5, '05 - May'], [6, '06 - June'], [7, '07 - July'], [8, '08 - August'], [9, '09 - September'], [10, '10 - October'], [11, '11 - November'], [12, '12 - December']];
    };

    var expYearOptions = function expYearOptions() {
        var currentYear = moment().year();
        var yearsOptions = ['Year'];
        for (var i = currentYear; i <= currentYear + 25; i++) {
            yearsOptions.push(i);
        }
        return yearsOptions;
    };

    var isInternational = function isInternational() {
        return !_$1.isEmpty(fields.countries()) ? fields.userCountryId() != _$1.findWhere(fields.countries(), { name: 'Brasil' }).id : false;
    };

    var scope = function scope(data) {
        return isInternational() ? I18nIntScope(data) : I18nScope$23(data);
    };

    var getLocale = function getLocale() {
        return isInternational() ? { locale: 'en' } : { locale: 'en' };
    };

    var faq = function faq() {
        var mode = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'aon';
        return I18n$1.translations[I18n$1.currentLocale()].projects.faq[mode];
    },
        currentUser = h.getUser() || {},
        countriesLoader = postgrest$1.loader(models.country.getPageOptions()),
        statesLoader = postgrest$1.loader(models.state.getPageOptions());

    var checkEmptyFields = function checkEmptyFields(checkedFields) {
        return _$1.map(checkedFields, function (field) {
            var val = fields[field]();

            if (!h.existy(val) || _$1.isEmpty(String(val).trim())) {
                fields.errors().push({ field: field, message: I18n$1.t('validation.empty_field', scope()) });
            }
        });
    };

    var checkEmail = function checkEmail() {
        var isValid = h.validateEmail(fields.email());

        if (!isValid) {
            fields.errors().push({ field: 'email', message: I18n$1.t('validation.email', scope()) });
        }
    };

    var checkDocument = function checkDocument() {
        var document = fields.ownerDocument() || '',
            striped = String(document).replace(/[\.|\-|\/]*/g, '');
        var isValid = false,
            errorMessage = '';

        if (document.length > 14) {
            isValid = h.validateCnpj(document);
            errorMessage = 'invalid CNPJ.';
        } else {
            isValid = h.validateCpf(striped);
            errorMessage = 'invalid CPF.';
        }

        if (!isValid) {
            fields.errors().push({ field: 'ownerDocument', message: errorMessage });
        }
    };

    var checkUserState = function checkUserState() {
        if (_$1.isEmpty(fields.userState()) || fields.userState() === 'null') {
            fields.errors().push({ field: 'userState', message: I18n$1.t('validation.state', scope()) });
        }
    };

    var checkPhone = function checkPhone() {
        var phone = fields.phone(),
            strippedPhone = String(phone).replace(/[\(|\)|\-|\s]*/g, ''),
            error = { field: 'phone', message: I18n$1.t('validation.phone', scope()) };

        if (strippedPhone.length < 10) {
            fields.errors().push(error);
        } else {
            var controlDigit = Number(strippedPhone.charAt(2));
            if (!(controlDigit >= 2 && controlDigit <= 9)) {
                fields.errors().push(error);
            }
        }
    };

    var validate = function validate() {
        fields.errors([]);

        // checkEmptyFields(['completeName', 'zipCode', 'street', 'userState', 'city', 'userCountryId']);
        checkEmptyFields(['completeName', 'street', 'city', 'userCountryId', 'phone']);

        if (!isInternational()) {
            checkEmptyFields(['phone', 'number', 'neighbourhood', 'ownerDocument', 'userState']);
            checkUserState();
            checkDocument();
            checkPhone();
        }
        return _$1.isEmpty(fields.errors());
    };

    var getSlipPaymentDate = function getSlipPaymentDate(contribution_id) {
        var paymentDate = m.prop();

        m.request({
            method: 'GET',
            config: setCsrfToken,
            url: '/payment/pagarme/' + contribution_id + '/slip_data'
        }).then(paymentDate);

        return paymentDate;
    };

    var sendSlipPayment = function sendSlipPayment(contribution_id, project_id, error, loading, completed) {
        m.request({
            method: 'post',
            url: '/payment/pagarme/' + contribution_id + '/pay_slip.json',
            dataType: 'json'
        }).then(function (data) {
            if (data.payment_status == 'failed') {
                error(I18n$1.t('submission.slip_submission', scope()));
            } else if (data.boleto_url) {
                completed(true);
                window.location.href = '/projects/' + project_id + '/contributions/' + contribution_id;
            }
            loading(false);
            m.redraw();
        }).catch(function (err) {
            error(I18n$1.t('submission.slip_submission', scope()));
            loading(false);
            completed(false);
            m.redraw();
        });
    };

    var paySlip = function paySlip(contribution_id, project_id, error, loading, completed) {
        error(false);
        m.redraw();
        if (validate()) {
            updateContributionData(contribution_id, project_id).then(function () {
                sendSlipPayment(contribution_id, project_id, error, loading, completed);
            }).catch(function () {
                loading(false);
                error(I18n$1.t('submission.slip_validation', scope()));
                m.redraw();
            });
        } else {
            loading(false);
            error(I18n$1.t('submission.slip_validation', scope()));
            m.redraw();
        }
    };

    var savedCreditCards = m.prop([]);

    var getSavedCreditCards = function getSavedCreditCards(user_id) {
        var otherSample = {
            id: -1
        };

        return m.request({
            method: 'GET',
            config: setCsrfToken,
            url: '/users/' + user_id + '/credit_cards'
        }).then(function (creditCards) {
            if (_$1.isArray(creditCards)) {
                creditCards.push(otherSample);
            } else {
                creditCards = [];
            }

            return savedCreditCards(creditCards);
        });
    };

    var similityExecute = function similityExecute(contribution_id) {
        if (window.SimilityScript && h.getSimilityCustomer()) {
            var user = h.getUser() || {};
            var similityContext = {
                customer_id: h.getSimilityCustomer(),
                session_id: contribution_id,
                user_id: user.user_id
            };
            var ss = new window.SimilityScript(similityContext);
            ss.execute();
        }
    };

    var requestPayment = function requestPayment(data, contribution_id) {
        similityExecute(contribution_id);
        return m.request({
            method: 'POST',
            url: '/payment/pagarme/' + contribution_id + '/pay_credit_card',
            data: data,
            config: setCsrfToken
        });
    };

    var payWithSavedCard = function payWithSavedCard(creditCard, installment, contribution_id) {
        var data = {
            card_id: creditCard.card_key,
            payment_card_installments: installment
        };
        return requestPayment(data, contribution_id);
    };

    var setNewCreditCard = function setNewCreditCard() {
        var creditCard = new window.PagarMe.creditCard();
        creditCard.cardHolderName = creditCardFields.name();
        creditCard.cardExpirationMonth = creditCardFields.expMonth();
        creditCard.cardExpirationYear = creditCardFields.expYear();
        creditCard.cardNumber = creditCardFields.number();
        creditCard.cardCVV = creditCardFields.cvv();
        return creditCard;
    };

    var payWithNewCard = function payWithNewCard(contribution_id, installment) {
        var deferred = m.deferred();
        m.request({
            method: 'GET',
            url: '/payment/pagarme/' + contribution_id + '/get_encryption_key',
            config: setCsrfToken
        }).then(function (data) {
            window.PagarMe.encryption_key = data.key;
            var card = setNewCreditCard();
            var errors = card.fieldErrors();
            if (_$1.keys(errors).length > 0) {
                deferred.reject({ message: I18n$1.t('submission.card_invalid', scope()) });
            } else {
                card.generateHash(function (cardHash) {
                    var data = {
                        card_hash: cardHash,
                        save_card: creditCardFields.save().toString(),
                        payment_card_installments: installment
                    };

                    requestPayment(data, contribution_id).then(deferred.resolve).catch(deferred.reject);
                });
            }
        }).catch(function (error) {
            if (!_$1.isEmpty(error.message)) {
                deferred.reject(error);
            } else {
                deferred.reject({ message: I18n$1.t('submission.encryption_error', scope()) });
            }
        });

        return deferred.promise;
    };

    var updateContributionData = function updateContributionData(contribution_id, project_id) {
        var contributionData = {
            anonymous: fields.anonymous(),
            country_id: fields.userCountryId(),
            payer_name: fields.completeName(),
            payer_document: fields.ownerDocument(),
            address_street: fields.street(),
            address_number: fields.number(),
            address_complement: fields.addressComplement(),
            address_neighbourhood: fields.neighbourhood(),
            address_zip_code: fields.zipCode(),
            address_city: fields.city(),
            address_state: fields.userState(),
            address_phone_number: fields.phone(),
            card_owner_document: creditCardFields.cardOwnerDocument()
        };

        return m.request({
            method: 'PUT',
            url: '/projects/' + project_id + '/contributions/' + contribution_id + '.json',
            data: { contribution: contributionData },
            config: setCsrfToken
        });
    };

    var creditCardPaymentSuccess = function creditCardPaymentSuccess(deferred, project_id, contribution_id) {
        return function (data) {
            if (data.payment_status === 'failed') {
                var errorMsg = data.message || I18n$1.t('submission.payment_failed', scope());

                isLoading(false);
                submissionError(I18n$1.t('submission.error', scope({ message: errorMsg })));
                m.redraw();
                deferred.reject();
            } else {
                window.location.href = '/projects/' + project_id + '/contributions/' + contribution_id;
            }
        };
    };

    var creditCardPaymentFail = function creditCardPaymentFail(deferred) {
        return function (data) {
            var errorMsg = data.message || I18n$1.t('submission.payment_failed', scope());
            isLoading(false);
            submissionError(I18n$1.t('submission.error', scope({ message: errorMsg })));
            m.redraw();
            deferred.reject();
        };
    };

    var checkAndPayCreditCard = function checkAndPayCreditCard(deferred, selectedCreditCard, contribution_id, project_id, selectedInstallment) {
        return function () {
            if (selectedCreditCard().id && selectedCreditCard().id !== -1) {
                return payWithSavedCard(selectedCreditCard(), selectedInstallment(), contribution_id).then(creditCardPaymentSuccess(deferred, project_id, contribution_id)).catch(creditCardPaymentFail(deferred));
            }
            return payWithNewCard(contribution_id, selectedInstallment).then(creditCardPaymentSuccess(deferred, project_id, contribution_id)).catch(creditCardPaymentFail(deferred));
        };
    };

    var sendPayment = function sendPayment(selectedCreditCard, selectedInstallment, contribution_id, project_id) {
        var deferred = m.deferred();
        if (validate()) {
            isLoading(true);
            submissionError(false);
            m.redraw();
            updateContributionData(contribution_id, project_id).then(checkAndPayCreditCard(deferred, selectedCreditCard, contribution_id, project_id, selectedInstallment)).catch(function () {
                isLoading(false);
                deferred.reject();
            });
        } else {
            isLoading(false);
            deferred.reject();
        }
        return deferred.promise;
    };

    var resetFieldError = function resetFieldError(fieldName) {
        return function () {
            var errors = fields.errors(),
                errorField = _$1.findWhere(fields.errors(), { field: fieldName }),
                newErrors = _$1.compose(fields.errors, _$1.without);

            return newErrors(fields.errors(), errorField);
        };
    };

    var resetCreditCardFieldError = function resetCreditCardFieldError(fieldName) {
        return function () {
            var errors = fields.errors(),
                errorField = _$1.findWhere(creditCardFields.errors(), { field: fieldName }),
                newErrors = _$1.compose(creditCardFields.errors, _$1.without);

            return newErrors(creditCardFields.errors(), errorField);
        };
    };

    var installments = m.prop([{ value: 10, number: 1 }]);

    var getInstallments = function getInstallments(contribution_id) {
        return m.request({
            method: 'GET',
            url: '/payment/pagarme/' + contribution_id + '/get_installment',
            config: h.setCsrfToken
        }).then(installments);
    };

    var creditCardMask = _$1.partial(h.mask, '9999 9999 9999 9999');

    var applyCreditCardMask = _$1.compose(creditCardFields.number, creditCardMask);

    countriesLoader.load().then(function (data) {
        var countryId = fields.userCountryId() || _$1.findWhere(data, { name: 'Brasil' }).id;
        fields.countries(_$1.sortBy(data, 'name_en'));
        fields.userCountryId(countryId);

        userVM.fetchUser(currentUser.user_id, false).then(populateForm);
    });

    statesLoader.load().then(function (data) {
        fields.states().push({ acronym: null, name: 'state' });
        _$1.map(data, function (state) {
            return fields.states().push(state);
        });
    });

    return {
        fields: fields,
        validate: validate,
        isInternational: isInternational,
        resetFieldError: resetFieldError,
        getSlipPaymentDate: getSlipPaymentDate,
        paySlip: paySlip,
        installments: installments,
        getInstallments: getInstallments,
        savedCreditCards: savedCreditCards,
        getSavedCreditCards: getSavedCreditCards,
        applyCreditCardMask: applyCreditCardMask,
        creditCardFields: creditCardFields,
        resetCreditCardFieldError: resetCreditCardFieldError,
        expMonthOptions: expMonthOptions,
        expYearOptions: expYearOptions,
        sendPayment: sendPayment,
        submissionError: submissionError,
        isLoading: isLoading,
        pagarme: pagarme,
        locale: getLocale,
        faq: faq,
        similityExecute: similityExecute
    };
};

var I18nScope$24 = _$1.partial(h.i18nScope, 'projects.contributions');

var rewardSelectCard = {
    controller: function controller(args) {
        var setInput = function setInput(el, isInitialized) {
            return !isInitialized ? el.focus() : null;
        };
        var isSelected = function isSelected(currentReward) {
            return currentReward.id === rewardVM.selectedReward().id;
        };
        var selectedDestination = m.prop('');
        var queryRewardId = h.getParams('reward_id');

        var submitContribution = function submitContribution(event) {
            var valueFloat = h.monetaryToFloat(rewardVM.contributionValue);
            var shippingFee = rewardVM.hasShippingOptions(rewardVM.selectedReward()) ? rewardVM.shippingFeeForCurrentReward(selectedDestination) : {
                value: 0
            };

            if (!selectedDestination() && rewardVM.hasShippingOptions(rewardVM.selectedReward())) {
                rewardVM.error('Please select a valid freight option.');
            } else if (valueFloat < rewardVM.selectedReward().minimum_value + shippingFee.value) {
                rewardVM.error('The support amount for this reward must be at least Rs' + rewardVM.selectedReward().minimum_value + ' + freight Rs' + h.formatNumber(shippingFee.value));
            } else {
                rewardVM.error('');
                var valueUrl = window.encodeURIComponent(String(valueFloat).replace('.', ','));
                h.navigateTo('/projects/' + projectVM.currentProject().project_id + '/contributions/fallback_create?contribution%5Breward_id%5D=' + rewardVM.selectedReward().id + '&contribution%5Bvalue%5D=' + valueUrl + '&contribution%5Bshipping_fee_id%5D=' + shippingFee.id);
            }

            event.stopPropagation();

            return false;
        };

        var selectDestination = function selectDestination(destination) {
            selectedDestination(destination);
            var shippingFee = rewardVM.shippingFeeForCurrentReward(selectedDestination) ? Number(rewardVM.shippingFeeForCurrentReward(selectedDestination).value) : 0;
            var rewardMinValue = Number(rewardVM.selectedReward().minimum_value);
            rewardVM.applyMask(shippingFee + rewardMinValue + ',00');
        };

        var normalReward = function normalReward(reward) {
            if (_$1.isEmpty(reward)) {
                return {
                    id: null,
                    description: 'I just want to help the campaign.',
                    minimum_value: 10,
                    shipping_options: null,
                    row_order: -999999
                };
            }

            return reward;
        };

        if (args.reward.id === Number(queryRewardId)) {
            rewardVM.selectReward(args.reward).call();
        }

        rewardVM.getStates();

        return {
            normalReward: normalReward,
            isSelected: isSelected,
            setInput: setInput,
            submitContribution: submitContribution,
            selectDestination: selectDestination,
            selectedDestination: selectedDestination,
            locationOptions: rewardVM.locationOptions,
            states: rewardVM.getStates(),
            selectReward: rewardVM.selectReward,
            error: rewardVM.error,
            applyMask: rewardVM.applyMask,
            contributionValue: rewardVM.contributionValue
        };
    },
    view: function view(ctrl, args) {
        var reward = ctrl.normalReward(args.reward);

        return h.rewardSouldOut(reward) ? m('') : m('span.radio.w-radio.w-clearfix.back-reward-radio-reward', {
            class: ctrl.isSelected(reward) ? 'selected' : '',
            onclick: ctrl.selectReward(reward)
        }, m('label[for="contribution_reward_id_' + reward.id + '"]', [m('input.radio_buttons.optional.w-input.text-field.w-radio-input.back-reward-radio-button[id="contribution_reward_id_' + reward.id + '"][type="radio"][value="' + reward.id + '"]', {
            checked: ctrl.isSelected(reward),
            name: 'contribution[reward_id]'
        }), m('label.w-form-label.fontsize-base.fontweight-semibold.u-marginbottom-10[for="contribution_reward_' + reward.id + '"]', 'Rs ' + h.formatNumber(reward.minimum_value) + ' or more'), !ctrl.isSelected(reward) ? '' : m('.w-row.back-reward-money', [rewardVM.hasShippingOptions(reward) ? m('.w-sub-col.w-col.w-col-4', [m('.fontcolor-secondary.u-marginbottom-10', 'Delivery place'), m('select.positive.text-field.w-select', {
            onchange: m.withAttr('value', ctrl.selectDestination)
        }, _$1.map(ctrl.locationOptions(reward, ctrl.selectedDestination), function (option) {
            return m('option[value="' + option.value + '"]', [option.name + ' ', option.value != '' ? '+Rs' + option.fee : null]);
        }))]) : '', m('.w-sub-col.w-col.w-clearfix', {
            class: rewardVM.hasShippingOptions(reward) ? 'w-col-4' : 'w-col-8'
        }, [m('.fontcolor-secondary.u-marginbottom-10', 'Value of support'), m('.w-row.u-marginbottom-20', [m('.w-col.w-col-3.w-col-small-3.w-col-tiny-3', m('.back-reward-input-reward.medium.placeholder', 'Rs')), m('.w-col.w-col-9.w-col-small-9.w-col-tiny-9', m('input.back-reward-input-reward.medium.w-input', {
            autocomplete: 'off',
            min: reward.minimum_value,
            placeholder: reward.minimum_value,
            type: 'tel',
            config: ctrl.setInput,
            onkeyup: m.withAttr('value', ctrl.applyMask),
            value: ctrl.contributionValue()
        }))]), m('.fontsize-smaller.text-error.u-marginbottom-20.w-hidden', [m('span.fa.fa-exclamation-triangle'), ' Support amount is incorrect'])]), m('.submit-form.w-col.w-col-4', m('button.btn.btn-medium.u-margintop-30', {
            onclick: ctrl.submitContribution
        }, ['Continue  ', m('span.fa.fa-chevron-right')]))]), ctrl.error().length > 0 && ctrl.isSelected(reward) ? m('.text-error', [m('br'), m('span.fa.fa-exclamation-triangle'), ' ' + ctrl.error()]) : '', m('.fontsize-smaller.fontweight-semibold', reward.title), m('.back-reward-reward-description', [m('.fontsize-smaller.u-marginbottom-10.fontcolor-secondary', reward.description), m('.u-marginbottom-20.w-row', [!reward.deliver_at ? '' : m('.w-col.w-col-6', [m('.fontsize-smallest.fontcolor-secondary', 'Estimated delivery time:'), m('.fontsize-smallest', h.momentify(reward.deliver_at, 'MMM/YYYY'))]), !rewardVM.hasShippingOptions(reward) && reward.shipping_options !== 'presential' ? '' : m('.w-col.w-col-6', [m('.fontsize-smallest.fontcolor-secondary', 'Send:'), m('.fontsize-smallest', I18n$1.t('shipping_options.' + reward.shipping_options, I18nScope$24()))])])])]));
    }
};

var I18nScope$25 = _.partial(h.i18nScope, 'projects.faq');

var faqBox = {
    controller: function controller(args) {
        var mode = args.mode,
            questions = args.faq.questions,
            selectedQuestion = m.prop(-1),
            user = m.prop({ name: '...' }),
            tKey = function tKey() {
            return !args.vm.isInternational() ? '' + mode : 'international.' + mode;
        };

        var selectQuestion = function selectQuestion(idx) {
            return function () {
                return idx === selectedQuestion() ? selectedQuestion(-1) : selectedQuestion(idx);
            };
        };

        // This function rewrites questions from translate with proper scope for links
        var scopedQuestions = function scopedQuestions() {
            var updatedQuestions = {};
            _.each(questions, function (quest, idx) {
                _.extend(updatedQuestions, defineProperty({}, idx + 1, {
                    question: I18n$1.t(tKey() + '.questions.' + idx + '.question', I18nScope$25()),
                    answer: I18n$1.t(tKey() + '.questions.' + idx + '.answer', I18nScope$25({ userLink: '/users/' + user().id,
                        userName: user().name
                    }))
                }));
            });
            return updatedQuestions;
        };

        userVM.fetchUser(args.projectUserId, false).then(function (data) {
            return user(_.first(data));
        });

        return {
            scopedQuestions: scopedQuestions,
            selectQuestion: selectQuestion,
            selectedQuestion: selectedQuestion,
            tKey: tKey
        };
    },
    view: function view(ctrl, args) {
        return m('.faq-box.w-hidden-small.w-hidden-tiny.card.u-radius', [m('.w-row.u-marginbottom-30', [m('.w-col.w-col-2.w-col-small-2.w-col-tiny-2', m('img[width=\'30\']', {
            src: args.mode === 'aon' ? '/assets/aon-badge.png' : '/assets/flex-badge.png'
        })), m('.w-col.w-col-10.w-col-small-10.w-col-tiny-10', m('.w-inline-block.fontsize-smallest.w-inline-block.fontcolor-secondary', I18n$1.t(ctrl.tKey() + '.description', I18nScope$25())))]), m('.u-marginbottom-20.fontsize-small.fontweight-semibold', I18n$1.t('' + (args.vm.isInternational() ? 'international_title' : 'title'), I18nScope$25())), m('ul.w-list-unstyled', _.map(ctrl.scopedQuestions(), function (question, idx) {
            return [m('li#faq_question_' + idx + '.fontsize-smaller.alt-link.list-question', {
                onclick: ctrl.selectQuestion(idx)
            }, m('span', [m('span.faq-box-arrow'), ' ' + question.question])), m('li.list-answer', {
                class: ctrl.selectedQuestion() === idx ? 'list-answer-opened' : ''
            }, m('p#faq_answer_' + idx + '.fontsize-smaller', m.trust(question.answer)))];
        }))]);
    }
};

var I18nScope$22 = _$1.partial(h.i18nScope, 'projects.contributions');

var projectsContribution = {
    controller: function controller(args) {
        // const rewards = () => _.union(
        //     [{
        //         id: null,
        //         description: 'Thank you. I just want to help the project.',
        //         minimum_value: 10,
        //         shipping_options: null,
        //         row_order: -9999999
        //     }],
        //     projectVM.rewardDetails()
        // );
        var rewards = function rewards() {
            return [{}];
        };
        var submitContribution = function submitContribution() {
            var valueFloat = h.monetaryToFloat(rewardVM.contributionValue);

            if (valueFloat < rewardVM.selectedReward().minimum_value) {
                rewardVM.error('The support amount for this reward must be at least Rs' + rewardVM.selectedReward().minimum_value);
            } else {
                rewardVM.error('');
                h.navigateTo('/projects/' + projectVM.currentProject().project_id + '/contributions/fallback_create?contribution%5Breward_id%5D=' + rewardVM.selectedReward().id + '&contribution%5Bvalue%5D=' + valueFloat);
            }

            return false;
        };

        projectVM.getCurrentProject();
        return {
            project: projectVM.currentProject,
            paymentVM: paymentVM(),
            submitContribution: submitContribution,
            // sortedRewards: () => _.sortBy(rewards(), reward => Number(reward.row_order))
            sortedRewards: function sortedRewards() {
                return rewards();
            }
        };
    },
    view: function view(ctrl, args) {
        var project = ctrl.project;
        return m('#contribution-new', !_$1.isEmpty(project()) ? [m('.w-section.section-product.' + project().mode), m(projectHeaderTitle, {
            project: project
        }), m('.w-section.header-cont-new', m('.w-container', m('.fontweight-semibold.lineheight-tight.text-success.fontsize-large.u-text-center-small-only', 'Value of your support'))), m('.section', m('.w-container', m('.w-row', [m('.w-col.w-col-8', m('.w-form.back-reward-form', m('form.simple_form.new_contribution[accept-charset="UTF-8"][action="/en/projects/' + project().id + '/contributions/fallback_create"][id="contribution_form"][method="get"][novalidate="novalidate"]', { onsubmit: ctrl.submitContribution }, [m('input[name="utf8"][type="hidden"][value="✓"]'), _$1.map(ctrl.sortedRewards(), function (reward) {
            return m(rewardSelectCard, { reward: reward });
        })]))), m('.w-col.w-col-4', [m('.card.u-marginbottom-20.u-radius.w-hidden-small.w-hidden-tiny', [m('.fontsize-small.fontweight-semibold', I18n$1.t('contribution_warning.title', I18nScope$22())), m('.fontsize-smaller.u-marginbottom-10', I18n$1.t('contribution_warning.subtitle', I18nScope$22())), m('.fontcolor-secondary.fontsize-smallest.u-marginbottom-10', I18n$1.t('contribution_warning.info', I18nScope$22()))]), m.component(faqBox, {
            mode: project().mode,
            vm: ctrl.paymentVM,
            faq: ctrl.paymentVM.faq(project().mode),
            projectUserId: args.project_user_id
        })])])))] : h.loader());
    }
};

//       weak
var userHeader = {
    view: function view(ctrl, args) {
        var user = args.user,
            hideDetails = args.hideDetails,
            profileImage = userVM.displayImage(user),
            coverImage = userVM.displayCover(user);

        return m('.hero-' + (hideDetails ? 'small' : 'half'), [m('.w-container.content-hero-profile', m('.w-row.u-text-center', m('.w-col.w-col-8.w-col-push-2', [hideDetails ? '' : m('.u-marginbottom-20', m('.avatar_wrapper', m('img.thumb.big.u-round[alt=\'User\'][src=\'' + profileImage + '\']'))), m('.fontsize-larger.fontweight-semibold.u-marginbottom-20', userVM.displayName(user)), hideDetails ? '' : m('.w-hidden-small.w-hidden-tiny.u-marginbottom-40.fontsize-base', ['Joined on ' + h.momentify(user.created_at, 'MMMM YYYY'), m('br'), user.total_contributed_projects == 0 ? 'Has not yet backed any campaigns' : 'Backed ' + h.pluralize(user.total_contributed_projects, ' campaign', ' campaigns'), user.total_published_projects > 0 ? ' And already created ' + h.pluralize(user.total_published_projects, ' campaign', ' campaigns') : ''])]))), m('.hero-profile', { style: 'background-image:url(\'' + coverImage + '\');' })]);
    }
};

var inlineError = {
    view: function view(ctrl, args) {
        return m('.fontsize-smaller.text-error.u-marginbottom-20.fa.fa-exclamation-triangle', m('span', ' ' + args.message));
    }
};

/**
 * window.c.loadMoreBtn component
 * Button to paginate collection
 *
 * Example of use:
 * view: () => {
 *   ...
 *   m.component(c.loadMoreBtn, {collection: collection, cssClass: 'class'})
 *   ...
 * }
 */
var loadMoreBtn = {
    view: function view(ctrl, args) {
        var collection = args.collection,
            cssClass = args.cssClass;
        return m('.w-col.w-col-2' + cssClass, [!collection.isLoading() ? collection.isLastPage() ? '' : m('button#load-more.btn.btn-medium.btn-terciary', {
            onclick: collection.nextPage
        }, 'Load more') : h.loader()]);
    }
};

var userCreated = {
    controller: function controller(args) {
        var user_id = args.userId,
            showDraft = args.showDraft || false,
            error = m.prop(false),
            pages = postgrest$1.paginationVM(models.project),
            loader = m.prop(true),
            contextVM = postgrest$1.filtersVM({
            project_user_id: 'eq',
            state: 'in'
        });

        var states = ['online', 'waiting_funds', 'successful', 'failed'];
        if (showDraft) {
            states.push('draft');
        }
        contextVM.state(states).project_user_id(user_id).order({
            updated_at: 'desc'
        });

        models.project.pageSize(9);
        pages.firstPage(contextVM.parameters()).then(function () {
            loader(false);
        }).catch(function (err) {
            error(true);
            loader(false);
            m.redraw();
        });

        return {
            projects: pages,
            loader: loader,
            error: error
        };
    },
    view: function view(ctrl, args) {
        var projects_collection = ctrl.projects.collection();

        return m('.content[id=\'created-tab\']', ctrl.error() ? m.component(inlineError, {
            message: 'Error loading projects.'
        }) : !ctrl.loader() ? [!_$1.isEmpty(projects_collection) ? _$1.map(projects_collection, function (project) {
            return m.component(projectCard, {
                project: project,
                ref: 'user_contributed',
                showFriends: false
            });
        }) : m('.w-container', m('.u-margintop-30.u-text-center.w-row', [m('.w-col.w-col-3'), m('.w-col.w-col-6', [m('.fontsize-large.u-marginbottom-30', 'It`s Time To Fund Your Idea'), m('.w-row', [m('.w-col.w-col-3'), m('.w-col.w-col-6', m('a.btn.btn-large[href=\'/start\']', 'GET STARTED FOR FREE')), m('.w-col.w-col-3')])]), m('.w-col.w-col-3')])), !_$1.isEmpty(projects_collection) ? m('.w-row.u-marginbottom-40.u-margintop-30', [m(loadMoreBtn, {
            collection: ctrl.projects,
            cssClass: '.w-col-push-5'
        })]) : ''] : h.loader());
    }
};

var userContributed = {
    controller: function controller(args) {
        var contributedProjects = m.prop(),
            user_id = args.userId,
            pages = postgrest$1.paginationVM(models.project),
            error = m.prop(false),
            loader = m.prop(true),
            contextVM = postgrest$1.filtersVM({
            project_id: 'in'
        });

        userVM.getPublicUserContributedProjects(user_id, null).then(function (data) {
            contributedProjects(data);
            if (!_$1.isEmpty(contributedProjects())) {
                contextVM.project_id(_$1.pluck(contributedProjects(), 'project_id')).order({
                    online_date: 'desc'
                });

                models.project.pageSize(9);
                pages.firstPage(contextVM.parameters()).then(function () {
                    loader(false);
                });
            } else {
                loader(false);
            }
        }).catch(function (err) {
            error(true);
            loader(false);
            m.redraw();
        });

        return {
            projects: pages,
            error: error,
            loader: loader
        };
    },
    view: function view(ctrl, args) {
        var projects_collection = ctrl.projects.collection();
        return ctrl.error() ? m.component(inlineError, { message: 'Error loading campaigns.' }) : ctrl.loader() ? h.loader() : m('.content[id=\'contributed-tab\']', [!_$1.isEmpty(projects_collection) ? _$1.map(projects_collection, function (project) {
            return m.component(projectCard, {
                project: project,
                ref: 'user_contributed',
                showFriends: false
            });
        }) : m('.w-container', m('.u-margintop-30.u-text-center.w-row', [m('.w-col.w-col-3'), m('.w-col.w-col-6', [m('.fontsize-large.u-marginbottom-30', 'No campaigns backed yet')]), m('.w-col.w-col-3')])), !_$1.isEmpty(projects_collection) ? m('.w-row.u-marginbottom-40.u-margintop-30', [m(loadMoreBtn, { collection: ctrl.projects, cssClass: '.w-col-push-5' })]) : '']);
    }
};

var userCard = {
    controller: function controller(args) {
        var userDetails = m.prop({}),
            user_id = args.userId;

        userVM.fetchUser(user_id, true, userDetails);

        return {
            userDetails: userDetails,
            displayModal: h.toggleProp(false, true)
        };
    },
    view: function view(ctrl) {
        var user = ctrl.userDetails(),
            contactModalC = [ownerMessageContent, ctrl.userDetails],
            profileImage = userVM.displayImage(user);

        return m('#user-card', m('.card.card-user.u-radius.u-marginbottom-30[itemprop=\'author\']', [m('.w-row', [m('.w-col.w-col-4.w.col-small-4.w-col-tiny-4.w-clearfix', m('img.thumb.u-round[itemprop=\'image\'][src=\'' + profileImage + '\'][width=\'100\']')), m('.w-col.w-col-8.w-col-small-8.w-col-tiny-8', [m('.fontsize-small.fontweight-semibold.lineheight-tighter[itemprop=\'name\']', m('a.link-hidden[href="/users/' + user.id + '"]', userVM.displayName(user))), m('.fontsize-smallest.lineheight-looser[itemprop=\'address\']', user.address_city), m('.fontsize-smallest', h.pluralize(user.total_published_projects, ' campaign', ' campaigns') + ' Created'), m('.fontsize-smallest', 'Backed ' + h.pluralize(user.total_contributed_projects, ' campaign', ' campaigns'))])]), m('.project-author-contacts', [m('ul.w-list-unstyled.fontsize-smaller.fontweight-semibold', [!_$1.isEmpty(user.facebook_link) ? m('li', [m('a.link-hidden[itemprop="url"][href="' + user.facebook_link + '"][target="_blank"]', 'Facebook Profile')]) : '', !_$1.isEmpty(user.twitter_username) ? m('li', [m('a.link-hidden[itemprop="url"][href="https://twitter.com/' + user.twitter_username + '"][target="_blank"]', 'Twitter Profile')]) : '', _$1.map(user.links, function (link) {
            return m('li', [m('a.link-hidden[itemprop="url"][href="' + link.link + '"][target="_blank"]', link.link)]);
        })])]), ctrl.displayModal() ? m.component(modalBox, {
            displayModal: ctrl.displayModal,
            content: contactModalC
        }) : '', m(UserFollowBtn, { follow_id: user.id, following: user.follwing_this_user, enabledClass: '.btn.btn-medium.btn-message.u-marginbottom-10', disabledClass: '.btn.btn-medium.btn-message.u-marginbottom-10' }), !_$1.isEmpty(user.email) ? m('a.btn.btn-medium.btn-message[href=\'javascript:void(0);\']', { onclick: ctrl.displayModal.toggle }, 'Send Message') : '']));
    }
};

var userAbout = {
    controller: function controller(args) {
        var userDetails = m.prop({}),
            loader = m.prop(true),
            error = m.prop(false),
            user_id = args.userId;

        userVM.fetchUser(user_id, true, userDetails).then(function () {
            loader(false);
        }).catch(function (err) {
            error(true);
            loader(false);
            m.redraw();
        });

        return {
            userDetails: userDetails,
            error: error,
            loader: loader
        };
    },
    view: function view(ctrl, args) {
        var user = ctrl.userDetails();
        return ctrl.error() ? m.component(inlineError, { message: 'Error loading data.' }) : ctrl.loader() ? h.loader() : m('.content[id=\'about-tab\']', m('.w-container[id=\'about-content\']', m('.w-row', [m('.w-col.w-col-8', m('.fontsize-base', user.about_html ? m.trust(user.about_html) : '')), m('.w-col.w-col-4', user.id ? m.component(userCard, { userId: user.id }) : h.loader)])));
    }
};

var usersShow = {
    controller: function controller(args) {
        var userDetails = m.prop({}),
            user_id = args.user_id.split('-')[0],
            hash = m.prop(window.location.hash),
            displayTabContent = function displayTabContent(user) {
            var tabs = {
                '#created': m.component(userCreated, { userId: user.id }),
                '#contributed': m.component(userContributed, { userId: user.id }),
                '#about': m.component(userAbout, { userId: user.id })
            };

            hash(window.location.hash);

            if (_$1.isEmpty(hash()) || hash() === '#_=_') {
                if (user.total_published_projects > 0) {
                    hash('#created');
                    return tabs['#created'];
                } else if (user.total_contributed_projects > 0) {
                    hash('#contributed');
                    return tabs['#contributed'];
                }

                hash('#about');
                return tabs['#about'];
            }

            return tabs[hash()];
        };

        h.redrawHashChange();

        userVM.fetchUser(user_id, true, userDetails);

        return {
            displayTabContent: displayTabContent,
            hash: hash,
            userDetails: userDetails
        };
    },
    view: function view(ctrl, args) {
        var user = ctrl.userDetails();

        return m('div', [m.component(userHeader, { user: user }), m('nav.project-nav.u-text-center.u-marginbottom-30.profile', { style: { 'z-index': '10', position: 'relative' } }, m('.w-container[data-anchor=\'created\']', [!_$1.isEmpty(user) ? user.is_owner_or_admin ? m('a.dashboard-nav-link.dashboard[href=\'/en/users/' + user.id + '/edit\']', { config: m.route,
            onclick: function onclick() {
                m.route('/users/edit/' + user.id, { user_id: user.id });
            } }, [m('span.fa.fa-cog'), m.trust('&nbsp;'), ' Edit Profile']) : '' : h.loader(), m('a[data-target=\'#contributed-tab\'][href=\'#contributed\'][id=\'contributed_link\'][class=\'dashboard-nav-link ' + (ctrl.hash() === '#contributed' ? 'selected' : '') + '\']', ['Backed ', m.trust('&nbsp;'), m('span.badge', user.total_contributed_projects)]), m('a[data-target=\'#created-tab\'][href=\'#created\'][id=\'created_link\'][class=\'dashboard-nav-link ' + (ctrl.hash() === '#created' ? 'selected' : '') + '\']', ['Created ', m.trust('&nbsp;'), m('span.badge', user.total_published_projects)]), m('a[data-target=\'#about-tab\'][href=\'#about\'][id=\'about_link\'][class=\'dashboard-nav-link ' + (ctrl.hash() === '#about' ? 'selected' : '') + '\']', 'About')])), m('section.section', m('.w-container', m('.w-row', user.id ? ctrl.displayTabContent(user) : h.loader())))]);
    }
};

// TODO: Define error pattern that comes from server-side and allow the lib
// to define what fields are coming with errors from the back-end
var generateErrorInstance = function generateErrorInstance() {
    var fields = m.prop([]);
    var submissionError = m.prop(false);
    var submissionErrorMsg = m.prop('');
    var fieldIdxValue = function fieldIdxValue(fieldName, idx, initialValue) {
        return _$1.reduce(fields(), function (memo, field) {
            return field[0] === fieldName ? field[idx] : memo;
        }, initialValue);
    };

    var setError = function setError(fieldName, flag) {
        var updated = _$1.map(fields(), function (field) {
            return field[0] === fieldName ? [field[0], field[1], flag] : field;
        });

        fields(updated);
    };

    var hasError = function hasError(fieldName) {
        return fieldIdxValue(fieldName, 2, false);
    };

    var getErrorMsg = function getErrorMsg(fieldName) {
        return fieldIdxValue(fieldName, 1, '');
    };

    var e = function e(fieldOrArray) {
        var errorMessage = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

        if (Array.isArray(fieldOrArray)) {
            _$1.map(fieldOrArray, function (field) {
                field.push(false);
                return fields().push(field);
            });
        } else {
            fields().push([fieldOrArray, errorMessage, false]);
        }
    };

    e.fields = fields;
    e.setSubmissionError = submissionErrorMsg;
    e.hasSubmissionError = function () {
        return submissionError() === true;
    };
    e.displaySubmissionError = function () {
        if (submissionError()) {
            return m('.card.card-error.u-radius.zindex-10.u-marginbottom-30.fontsize-smaller', m('.u-marginbottom-10.fontweight-bold', m.trust(submissionErrorMsg())));
        }

        return null;
    };
    e.submissionError = function (flag) {
        if (_$1.isUndefined(flag)) {
            return e.displaySubmissionError();
        }

        submissionError(flag);
    };

    e.hasError = hasError;
    e.inlineError = function (field, flag) {
        if (_$1.isUndefined(flag)) {
            if (hasError(field)) {
                return m(inlineError, { message: getErrorMsg(field) });
            }

            return null;
        }
        setError(field, flag);
    };

    e.resetFieldErrors = function () {
        return _$1.map(fields(), function (field) {
            return field[2] = false;
        });
    };

    e.resetErrors = function () {
        e.resetFieldErrors();
        submissionError(false);
    };

    return e;
};

var e$1 = generateErrorInstance();

var fields = {
    password: m.prop(''),
    current_password: m.prop(''),
    uploaded_image: m.prop(''),
    cover_image: m.prop(''),
    email: m.prop(''),
    permalink: m.prop(''),
    public_name: m.prop(''),
    facebook_link: m.prop(''),
    twitter: m.prop(''),
    links: m.prop([]),
    about_html: m.prop(''),
    email_confirmation: m.prop('')
};

var mapRailsErrors$1 = function mapRailsErrors(rails_errors) {
    var parsedErrors = void 0;
    try {
        parsedErrors = JSON.parse(rails_errors);
    } catch (e$1) {
        parsedErrors = {};
    }
    var extractAndSetErrorMsg = function extractAndSetErrorMsg(label, fieldArray) {
        var value = _$1.first(_$1.compact(_$1.map(fieldArray, function (field) {
            return _$1.first(parsedErrors[field]);
        })));

        if (value) {
            e$1(label, value);
            e$1.inlineError(label, true);
        }
    };

    //extractAndSetErrorMsg("about_html", ["user.about_html", "about_html"]);
    //extractAndSetErrorMsg("public_name", ["user.public_name", "public_name"]);

    return e$1;
};

var userAboutVM = {
    fields: fields,
    mapRailsErrors: mapRailsErrors$1
};

var projectEditSaveBtn = {
    view: function view(ctrl, args) {
        return m('.w-section.save-draft-btn-section', [m('.w-row', [m('.w-col.w-col-4.w-col-push-4', args.loading() ? h.loader() : [m('input[id="anchor"][name="anchor"][type="hidden"][value="about_me"]'), m('input.btn.btn.btn-large[name="commit"][type="submit"][value="Save"]', {
            onclick: args.onSubmit
        })]), m('.w-col.w-col-4')])]);
    }
};

var userAboutEdit = {
    controller: function controller(args) {
        var parsedErrors = userAboutVM.mapRailsErrors(railsErrorsVM.railsErrors());
        var deleteUser = void 0;
        var user = args.user || {},
            fields = {
            password: m.prop(''),
            current_password: m.prop(''),
            uploaded_image: m.prop(userVM.displayImage(user)),
            cover_image: m.prop(user.profile_cover_image || ''),
            email: m.prop(''),
            permalink: m.prop(user.permalink || ''),
            public_name: m.prop(user.public_name || ''),
            facebook_link: m.prop(user.facebook_link || ''),
            twitter: m.prop(user.twitter_username || ''),
            links: m.prop(user.links || []),
            about_html: m.prop(user.about_html || ''),
            email_confirmation: m.prop('')
        },
            passwordHasError = m.prop(false),
            emailHasError = m.prop(false),
            showEmailForm = h.toggleProp(false, true),
            showSuccess = m.prop(false),
            showError = m.prop(false),
            errors = m.prop(),
            loading = m.prop(false),
            uploading = m.prop(false),
            errorsArray = m.prop([]),
            pushErrosMessage = function pushErrosMessage() {
            errors(errorsArray().join('<br/>'));
        },
            updateFieldsFromUser = function updateFieldsFromUser() {
            userVM.fetchUser(args.userId, false).then(function (dataResponse) {
                var data = _$1.first(dataResponse);
                fields.uploaded_image(userVM.displayImage(data));
                fields.cover_image(data.profile_cover_image);
                fields.permalink(data.permalink);
                fields.public_name(data.public_name);
                fields.facebook_link(data.facebook_link);
                fields.twitter(data.twitter_username);
                fields.links(data.links);
                fields.about_html(data.about_html);
            });
        },
            uploadImage = function uploadImage() {
            var userUploadedImageEl = window.document.getElementById('user_uploaded_image'),
                userCoverImageEl = window.document.getElementById('user_cover_image'),
                formData = new FormData();

            if (userUploadedImageEl.files[0] || !args.hideCoverImg && userCoverImageEl.files[0]) {
                formData.append('uploaded_image', userUploadedImageEl.files[0]);
                if (!args.hideCoverImg) {
                    formData.append('cover_image', userCoverImageEl.files[0]);
                }

                uploading(true);
                m.redraw();

                return m.request({
                    method: 'POST',
                    url: '/users/' + user.id + '/upload_image.json',
                    data: formData,
                    config: h.setCsrfToken,
                    serialize: function serialize(data) {
                        return data;
                    }
                }).then(function (data) {
                    fields.uploaded_image(data.uploaded_image);
                    fields.cover_image(data.cover_image);
                    uploading(false);
                }).catch(function (err) {
                    if (_$1.isArray(err.errors)) {
                        errorsArray(errorsArray().concat(err.errors));
                    } else {
                        errors('Error updating information.');
                    }
                    pushErrosMessage();
                    showError(true);
                    uploading(false);
                });
            }

            return void 0;
        },
            updateUser = function updateUser() {
            var userData = {
                current_password: fields.current_password(),
                password: fields.password(),
                email: fields.email(),
                permalink: fields.permalink(),
                public_name: fields.public_name(),
                facebook_link: fields.facebook_link(),
                twitter: fields.twitter(),
                about_html: fields.about_html(),
                links_attributes: linkAttributes()
            };

            if (args.publishingUserAbout) {
                userData.publishing_user_about = true;
            }

            loading(true);
            m.redraw();
            uploadImage();

            return m.request({
                method: 'PUT',
                url: '/users/' + user.id + '.json',
                data: {
                    user: userData
                },
                config: h.setCsrfToken
            }).then(function () {
                showSuccess(true);
                updateFieldsFromUser();
                loading(false);
                m.redraw();
                railsErrorsVM.validatePublish();
            }).catch(function (err) {
                if (parsedErrors) {
                    parsedErrors.resetFieldErrors();
                }
                parsedErrors = userAboutVM.mapRailsErrors(err.errors_json);
                errors('Error updating information. ');

                showError(true);
                loading(false);
                m.redraw();
            });
        },
            removeLinks = [],
            addLink = function addLink() {
            return fields.links().push({
                link: ''
            });
        },
            removeLink = function removeLink(linkId, idx) {
            return function () {
                fields.links()[idx]._destroy = true;
                return false;
            };
        },
            linkAttributes = function linkAttributes() {
            return _$1.reduce(fields.links(), function (memo, item, index) {
                memo[index.toString()] = item;
                return memo;
            }, {});
        },
            validateEmailConfirmation = function validateEmailConfirmation() {
            if (fields.email() !== fields.email_confirmation()) {
                emailHasError(true);
            } else {
                emailHasError(false);
            }
            return !emailHasError();
        },
            validatePassword = function validatePassword() {
            var pass = String(fields.password());
            if (pass.length > 0 && pass.length <= 5) {
                passwordHasError(true);
            }

            return !passwordHasError();
        },
            setDeleteForm = function setDeleteForm(el, isInit) {
            if (!isInit) {
                deleteUser = function deleteUser() {
                    return el.submit();
                };
            }
        },
            deleteAccount = function deleteAccount() {
            if (window.confirm('Are you sure you want to deactivate your account?')) {
                deleteUser();
            }

            return false;
        },
            onSubmit = function onSubmit(e) {
            e.preventDefault();
            if (!validateEmailConfirmation()) {
                errors('Email confirmation is incorrect.');
                showError(true);
            } else if (!validatePassword()) {
                errors('New password is incorrect.');
                showError(true);
            } else {
                updateUser();
            }
            return false;
        };
        // Temporary fix for the menu selection bug. Should be fixed/removed as soon as we route all tabs from mithril.
        setTimeout(m.redraw, 0);

        return {
            removeLinks: removeLinks,
            removeLink: removeLink,
            addLink: addLink,
            fields: fields,
            loading: loading,
            showSuccess: showSuccess,
            showError: showError,
            errors: errors,
            uploading: uploading,
            onSubmit: onSubmit,
            emailHasError: emailHasError,
            showEmailForm: showEmailForm,
            validateEmailConfirmation: validateEmailConfirmation,
            passwordHasError: passwordHasError,
            validatePassword: validatePassword,
            deleteAccount: deleteAccount,
            setDeleteForm: setDeleteForm,
            parsedErrors: parsedErrors
        };
    },
    view: function view(ctrl, args) {
        var user = args.user || {},
            fields = ctrl.fields;
        return m('#about-tab.content', [ctrl.showSuccess() && !ctrl.loading() && !ctrl.uploading() ? m.component(popNotification, {
            message: 'Your information has been updated'
        }) : '', ctrl.showError() && !ctrl.loading() && !ctrl.uploading() ? m.component(popNotification, {
            message: m.trust(ctrl.errors()),
            error: true
        }) : '', m('form.simple_form.w-form', {
            onsubmit: ctrl.onSubmit
        }, [m('input[name="utf8"][type="hidden"][value="✓"]'), m('input[name="_method"][type="hidden"][value="patch"]'), m('input[name="authenticity_token"][type="hidden"][value=' + h.authenticityToken() + ']'), m('div', m('.w-container', m('.w-row', m('.w-col.w-col-10.w-col-push-1', [!user.is_admin ? '' : m('.w-row.u-marginbottom-30.card.card-terciary', [m('.w-col.w-col-5.w-sub-col', [m('label.field-label.fontweight-semibold', 'Your profile address'), m('label.field-label.fontsize-smallest.fontcolor-secondary', 'Your public profile may have a custom URL. Choose an easy to save!    ')]), m('.w-col.w-col-7', m('.w-row', [m('.w-col.w-col-6.w-col-small-6.w-col-tiny-6', m('input.string.optional.w-input.text-field.text-field.positive.prefix[id="user_permalink"][type="text"]', {
            name: 'user[permalink]',
            value: fields.permalink(),
            onchange: m.withAttr('value', fields.permalink)
        })), m('.w-col.w-col-6.w-col-small-6.w-col-tiny-6.text-field.postfix.no-hover', m('.fontcolor-secondary.fontsize-smaller', '  .grasruts.com'))]))]), m('.w-row.u-marginbottom-30.card.card-terciary', [m('.fontsize-base.fontweight-semibold', 'Email'), m('.fontsize-small.u-marginbottom-30', 'Keep this email updated as it is the channel of communication between you, the Grasruts team and the team of campaigns you have supported. '), m('.fontsize-base.u-marginbottom-40', [m('span.fontweight-semibold.card.u-radius', user.email), m('a.alt-link.fontsize-small.u-marginleft-10[href=\'javascript:void(0);\'][id=\'update_email\']', {
            onclick: function onclick() {
                ctrl.showEmailForm.toggle();
            }
        }, 'Change email')]), m((ctrl.showEmailForm() ? '' : '.w-hidden') + '.u-marginbottom-20.w-row[id=\'email_update_form\']', [m('.w-col.w-col-6.w-sub-col', [m('label.field-label.fontweight-semibold', 'New email'), m('input.w-input.text-field.positive[id=\'new_email\'][name=\'new_email\'][type=\'email\']', {
            class: ctrl.emailHasError() ? 'error' : '',
            value: fields.email(),
            onfocus: function onfocus() {
                return ctrl.emailHasError(false);
            },
            onchange: m.withAttr('value', fields.email)
        })]), m('.w-col.w-col-6', [m('label.field-label.fontweight-semibold', 'Confirm new email'), m('input.string.required.w-input.text-field.w-input.text-field.positive[id=\'new_email_confirmation\'][name=\'user[email]\'][type=\'text\']', {
            class: ctrl.emailHasError() ? 'error' : '',
            value: fields.email_confirmation(),
            onfocus: function onfocus() {
                return ctrl.emailHasError(false);
            },
            onblur: ctrl.validateEmailConfirmation,
            onchange: m.withAttr('value', fields.email_confirmation)
        })]), ctrl.emailHasError() ? m(inlineError, {
            message: 'Email confirmation is incorrect.'
        }) : ''])]), m('.w-row.u-marginbottom-30.card.card-terciary', [m('.w-col.w-col-5.w-sub-col', [m('label.field-label.fontweight-semibold', '  Name'), m('label.field-label.fontsize-smallest.fontcolor-secondary', 'This is the name that users will see on your profile.')]), m('.w-col.w-col-7', m('input.string.optional.w-input.text-field.positive[id="user_public_name"][type="text"]', {
            name: 'user[public_name]',
            class: ctrl.parsedErrors.hasError('public_name') ? 'error' : false,
            value: fields.public_name(),
            onchange: m.withAttr('value', fields.public_name)
        }), ctrl.parsedErrors.inlineError('public_name'))]), m('.w-form', [m('.w-row.u-marginbottom-30.card.card-terciary', [m('.w-col.w-col-5.w-sub-col', [m('label.field-label.fontweight-semibold', '  Profile picture'), m('label.field-label.fontsize-smallest.fontcolor-secondary', '  This image will be used as your profile thumbnail (PNG, JPG size 280x280)')]), m('.w-col.w-col-4.w-sub-col', m('.input.file.optional.user_uploaded_image.field_with_hint', [m('label.field-label'), m('span.hint', m('img[alt="User avatar"][src="' + fields.uploaded_image() + '"]')), m('input.file.optional.w-input.text-field[id="user_uploaded_image"][type="file"]', {
            name: 'user[uploaded_image]',
            class: ctrl.parsedErrors.hasError('uploaded_image') ? 'error' : false
        }), ctrl.parsedErrors.inlineError('uploaded_image')]))]), args.hideCoverImg ? '' : m('.w-row.u-marginbottom-30.card.card-terciary', [m('.w-col.w-col-5.w-sub-col', [m('label.field-label.fontweight-semibold', '  Profile Cover Image'), m('label.field-label.fontsize-smallest.fontcolor-secondary', '  This image will be used as the background of your public profile header (PNG or JPG). If you do not submit any images here, we will use your profile image as an alternative.')]), m('.w-col.w-col-4.w-sub-col', m('.input.file.optional.user_cover_image', [m('label.field-label'), m('span.hint', user.profile_cover_image ? m('img', {
            src: fields.cover_image()
        }) : ''), m('input.file.optional.w-input.text-field[id="user_cover_image"][type="file"]', {
            name: 'user[cover_image]'
        })]))])]), m('.w-row', m('.w-col', m('.card.card-terciary.u-marginbottom-30', [m('label.field-label.fontweight-semibold', 'About'), m('label.field-label.fontsize-smallest.fontcolor-secondary.u-marginbottom-20', 'Talk about yourself and try to provide the most relevant information so visitors can get to know you better. '), m('.w-form', m('.preview-container.u-marginbottom-40', {
            class: ctrl.parsedErrors.hasError('about_html') ? 'error' : false
        }, h.redactor('user[about_html]', fields.about_html)), ctrl.parsedErrors.inlineError('about_html'))]))), m('.w-form.card.card-terciary.u-marginbottom-30', [m('.w-row.u-marginbottom-10', [m('.w-col.w-col-5.w-sub-col', [m('label.field-label.fontweight-semibold', '  Facebook profile'), m('label.field-label.fontsize-smallest.fontcolor-secondary', ' Paste your profile link')]), m('.w-col.w-col-7', m('input.string.optional.w-input.text-field.positive[type="text"]', {
            name: 'user[facebook_link]',
            value: fields.facebook_link(),
            onchange: m.withAttr('value', fields.facebook_link)
        }))]), m('.w-row.u-marginbottom-10', [m('.w-col.w-col-5.w-sub-col', [m('label.field-label.fontweight-semibold', '  Twitter profile'), m('label.field-label.fontsize-smallest.fontcolor-secondary', ' Paste your profile link')]), m('.w-col.w-col-7', m('input.string.optional.w-input.text-field.positive[type="text"]', {
            name: 'user[twitter]',
            value: fields.twitter(),
            onchange: m.withAttr('value', fields.twitter)
        }))])]), m('.w-form.card.card-terciary.u-marginbottom-30', m('.w-row.u-marginbottom-10', [m('.w-col.w-col-5.w-sub-col', [m('label.field-label.fontweight-semibold[for="name-8"]', ' Other links'), m('label.field-label.fontsize-smallest.fontcolor-secondary[for="name-8"]', ' Include links to help other users get to know you better. ')]), m('.w-col.w-col-7', [m('.w-row', [fields.links() && fields.links().length <= 0 ? '' : m('.link', _$1.map(fields.links(), function (link, idx) {
            var toRemove = link._destroy;

            return m('div', {
                key: idx,
                class: toRemove ? 'w-hidden' : 'none'
            }, [m('.w-col.w-col-10.w-col-small-10.w-col-tiny-10', m('input.string.w-input.text-field.w-input.text-field][type="text"][value="' + link.link + '"]', {
                class: link.link === '' ? 'positive' : 'optional',
                name: 'user[links_attributes][' + idx + '][link]',
                onchange: m.withAttr('value', function (val) {
                    return fields.links()[idx].link = val;
                })
            })), m('.w-col.w-col-2.w-col-small-2.w-col-tiny-2', [m('a.btn.btn-small.btn-terciary.fa.fa-lg.fa-trash.btn-no-border', {
                onclick: ctrl.removeLink(link.id, idx)
            })])]);
        }))]), m('.w-row', [m('.w-col.w-col-6.w-col-push-6', m('a.btn.btn-small.btn-terciary', {
            onclick: ctrl.addLink
        }, m('span.translation_missing', 'Add Link')))])])])), args.hidePasswordChange ? '' : m('.w-form.card.card-terciary.u-marginbottom-30', m('.w-row.u-marginbottom-10', [m('.fontsize-base.fontweight-semibold', 'Change my password'), m('.fontsize-small.u-marginbottom-20', 'In order for the password to be changed you must confirm your current password.'), m('.w-row.u-marginbottom-20', [m('.w-col.w-col-6.w-sub-col', [m('label.field-label.fontweight-semibold', ' current password'), m('input.password.optional.w-input.text-field.w-input.text-field.positive[id=\'user_current_password\'][name=\'user[current_password]\'][type=\'password\']', {
            value: fields.current_password(),
            onchange: m.withAttr('value', fields.current_password)
        })]), m('.w-col.w-col-6', [m('label.field-label.fontweight-semibold', ' New password'), m('input.password.optional.w-input.text-field.w-input.text-field.positive[id=\'user_password\'][name=\'user[password]\'][type=\'password\']', {
            class: ctrl.passwordHasError() ? 'error' : '',
            value: fields.password(),
            onfocus: function onfocus() {
                return ctrl.passwordHasError(false);
            },
            onblur: ctrl.validatePassword,
            onchange: m.withAttr('value', fields.password)
        }), !ctrl.passwordHasError() ? '' : m(inlineError, {
            message: 'Your new password must be at least 6 characters.'
        })])])])), args.hideDisableAcc || user.total_published_projects > 0 ? '' : m('.w-form.card.card-terciary.u-marginbottom-30', m('.w-row.u-marginbottom-10', [m('.fontweight-semibold.fontsize-smaller', 'Disable my account'), m('.fontsize-smallest', 'All your support will be converted into anonymous backups, your data will no longer be visible, you will automatically exit the system and your account will be permanently disabled.'), m('a.alt-link.fontsize-smaller[href=\'/en/users/' + user.id + '\'][rel=\'nofollow\']', {
            onclick: ctrl.deleteAccount
        }, 'Disable my Grasruts account'), m('form.w-hidden', {
            action: '/en/users/' + user.id,
            method: 'post',
            config: ctrl.setDeleteForm
        }, [m('input[name=\'authenticity_token\'][type=\'hidden\'][value=\'' + h.authenticityToken() + '\']'), m('input[name=\'_method\'][type=\'hidden\'][value=\'delete\']')])]))]))), m(projectEditSaveBtn, {
            loading: ctrl.loading,
            onSubmit: ctrl.onSubmit
        }))])]);
    }
};

var I18nScope$26 = _$1.partial(h.i18nScope, 'payment.state');

var userContributedBox = {
    controller: function controller() {
        var toggleDelivery = function toggleDelivery(projectId, contribution) {
            userVM.toggleDelivery(projectId, contribution).then(function () {
                var lastStatus = contribution.reward_sent_at ? 'delivered' : 'undelivered';
                contribution.delivery_status = contribution.delivery_status == 'received' ? lastStatus : 'received'; // so we don't have to reload the page
            });
        };

        return {
            toggleAnonymous: userVM.toggleAnonymous,
            toggleDelivery: toggleDelivery
        };
    },
    view: function view(ctrl, args) {
        var collection = args.collection,
            pagination = args.pagination,
            title = args.title;

        return !_$1.isEmpty(collection) ? m('.section-one-column.u-marginbottom-30', [m('.fontsize-large.fontweight-semibold.u-marginbottom-30.u-text-center', title), m('.w-row.w-hidden-small.w-hidden-tiny.card.card-secondary', [m('.w-col.w-col-3', m('.fontsize-small.fontweight-semibold', 'Projects I supported')), m('.w-col.w-col-2', m('.fontsize-small.fontweight-semibold', 'Value of support')), m('.w-col.w-col-4', m('.fontsize-small.fontweight-semibold', 'Reward'))]), _$1.map(collection, function (contribution) {
            return m('.w-row.card', [m('.w-col.w-col-3', m('.w-row', [m('.w-col.w-col-4.u-marginbottom-10', m('a[href=\'/' + contribution.permalink + '\']', m('img.thumb-project.u-radius[alt=\'' + contribution.project_name + '\'][src=\'' + contribution.project_image + '\'][width=\'50\']'))), m('.w-col.w-col-8', m('.fontsize-small.fontweight-semibold', m('a.alt-link[href=\'/' + contribution.permalink + '\']', contribution.project_name)))])), m('.w-col.w-col-2.u-marginbottom-10', m('.fontsize-base.inline-block', [m('span.w-hidden-main.w-hidden-medium.fontweight-semibold', 'Value of support'), ' Rs ' + contribution.value])),
            // m('.w-col.w-col-3.u-marginbottom-10', [
            //     m('.w-hidden-main.w-hidden-medium.fontsize-smallest.fontweight-semibold',
            //         'Status'
            //     ),
            //
            //     m('.fontsize-smaller.fontweight-semibold', [
            //         m('.lineheight-tighter'),
            //         m(`span.fa.fa-circle.fontsize-smallest.${contribution.state === 'paid' ? 'text-success' : contribution.state === 'pending' ? 'text-waiting' : 'text-error'}`,
            //             m.trust('&nbsp;')
            //         ),
            //         I18n.t(contribution.state, I18nScope({
            //             date: h.momentify(contribution[`${contribution.state}_at`])
            //         }))
            //     ]),
            //     m('.fontsize-smallest',
            //         (contribution.installments > 1 ? (`${contribution.installments} x Rs ${contribution.installment_value} `) : ''),
            //         (contribution.payment_method === 'BoletoBancario' ? 'Boleto Bancário' : 'Cartão de Crédito')
            //     ),
            //
            //     (contributionVM.canShowReceipt(contribution) ?
            //         m(`a.btn.btn-inline.btn-small.u-margintop-10.btn-terciary[href='http://www.grasruts.com/en/projects/${contribution.project_id}/contributions/${contribution.contribution_id}/receipt'][target='__blank']`,
            //             'View Receipt'
            //         ) : ''),
            //
            //     (contributionVM.canShowSlip(contribution) ?
            //         m(`a.btn.btn-inline.btn-small.u-margintop-10[href='${contribution.gateway_data.boleto_url}'][target='__blank']`,
            //             'Imprimir boleto'
            //         ) : ''),
            //
            //     (contributionVM.canGenerateSlip(contribution) ?
            //         m(`a.btn.btn-inline.btn-small.u-margintop-10[href='http://www.grasruts.com/en/projects/${contribution.project_id}/contributions/${contribution.contribution_id}/second_slip'][target='__blank']`,
            //             'Gerar 2a via'
            //         ) : ''),
            //
            //     m('.w-checkbox.fontsize-smallest.fontcolor-secondary.u-margintop-10', [
            //         m(`input.w-checkbox-input[id='anonymous'][name='anonymous'][type='checkbox']${contribution.anonymous ? '[checked=\'checked\']' : ''}[value='1']`, {
            //             onclick: () => ctrl.toggleAnonymous(contribution.project_id, contribution)
            //         }),
            //         m('label.w-form-label',
            //             'I want my support not to be public'
            //         )
            //     ])
            // ]),
            m('.w-col.w-col-3', m('.fontsize-smallest', [m('span.w-hidden-main.w-hidden-medium.fontweight-semibold', 'Reward'), contribution.reward_id ? [m('.fontsize-smallest.fontweight-semibold', contribution.reward_title), m('.fontsize-smallest.fontcolor-secondary', m.trust(h.simpleFormat(contribution.reward_description)))] : ' You have not selected a reward']), contribution.deliver_at ? m('.fontsize-smallest.lineheight-looser', [m('span.fontweight-semibold', 'Estimated delivery: '), h.momentify(contribution.deliver_at, 'MMMM/YYYY')]) : '', contributionVM.canBeDelivered(contribution) ? m('.fontsize-smallest', [m('span.fontweight-semibold', 'Delivery status:'), m.trust('&nbsp;'), h.contributionStatusBadge(contribution)]) : ''), m(rewardReceiver, {
                contribution: contribution
            })]);
        }), m('.w-row.u-marginbottom-40.u-margintop-30', [m(loadMoreBtn, {
            collection: pagination,
            cssClass: '.w-col-push-5'
        })])]) : m('div', '');
    }
};

var userPrivateContributed = {
    controller: function controller(args) {
        var user_id = args.userId,
            onlinePages = postgrest$1.paginationVM(models.userContribution),
            successfulPages = postgrest$1.paginationVM(models.userContribution),
            failedPages = postgrest$1.paginationVM(models.userContribution),
            error = m.prop(false),
            loader = m.prop(true),
            handleError = function handleError() {
            error(true);
            loader(false);
            m.redraw();
        },
            contextVM = postgrest$1.filtersVM({
            user_id: 'eq',
            state: 'in',
            project_state: 'in'
        });

        models.userContribution.pageSize(9);
        contextVM.user_id(user_id).order({
            created_at: 'desc'
        }).state(['refunded', 'pending_refund', 'paid', 'refused', 'pending']);

        contextVM.project_state(['online', 'waiting_funds']);
        onlinePages.firstPage(contextVM.parameters()).then(function () {
            loader(false);
        }).catch(handleError);

        contextVM.project_state(['failed']);
        failedPages.firstPage(contextVM.parameters()).then(function () {
            loader(false);
        }).catch(handleError);

        contextVM.project_state(['successful']).state(['paid', 'refunded', 'pending_refund']);
        successfulPages.firstPage(contextVM.parameters()).then(function () {
            loader(false);
        }).catch(handleError);

        return {
            onlinePages: onlinePages,
            successfulPages: successfulPages,
            failedPages: failedPages,
            error: error,
            loader: loader
        };
    },
    view: function view(ctrl, args) {
        var onlineCollection = ctrl.onlinePages.collection(),
            successfulCollection = ctrl.successfulPages.collection(),
            failedCollection = ctrl.failedPages.collection();

        return m('.content[id=\'private-contributed-tab\']', ctrl.error() ? m.component(inlineError, {
            message: 'Error loading projects.'
        }) : ctrl.loader() ? h.loader() : _$1.isEmpty(onlineCollection) && _$1.isEmpty(successfulCollection) && _$1.isEmpty(failedCollection) ? m('.w-container', m('.w-row.u-margintop-30.u-text-center', [m('.w-col.w-col-3'), m('.w-col.w-col-6', [m('.fontsize-large.u-marginbottom-30', ['You Have Not Backed Any Campaign']), m('.w-row', [m('.w-col.w-col-3'), m('.w-col.w-col-6', m('a.btn.btn-large[href=\'/en/explore\']', {
            config: m.route,
            onclick: function onclick() {
                m.route('/explore');
            }
        }, 'SUPPORT NOW!')), m('.w-col.w-col-3')])]), m('.w-col.w-col-3')])) : [m.component(userContributedBox, {
            title: 'Projects in progress',
            collection: onlineCollection,
            pagination: ctrl.onlinePages
        }), m.component(userContributedBox, {
            title: 'Successful Projects',
            collection: successfulCollection,
            pagination: ctrl.successfulPages
        }), m.component(userContributedBox, {
            title: 'Non-funded projects',
            collection: failedCollection,
            pagination: ctrl.failedPages
        })]);
    }
};

var e$2 = generateErrorInstance();

var fields$1 = {
    owner_document: m.prop(''),
    country_id: m.prop(''),
    street: m.prop(''),
    number: m.prop(''),
    city: m.prop(''),
    zipcode: m.prop(''),
    complement: m.prop(''),
    neighbourhood: m.prop(''),
    state: m.prop(''),
    phonenumber: m.prop(''),
    name: m.prop(''),
    agency: m.prop(''),
    bank_id: m.prop(''),
    agency_digit: m.prop(''),
    account: m.prop(''),
    account_digit: m.prop(''),
    bank_account_id: m.prop(''),
    state_inscription: m.prop(''),
    birth_date: m.prop(''),
    account_type: m.prop(''),
    bank_account_type: m.prop('')
};

var mapRailsErrors$2 = function mapRailsErrors(rails_errors) {
    var parsedErrors = void 0;
    try {
        parsedErrors = JSON.parse(rails_errors);
    } catch (e$2) {
        parsedErrors = {};
    }
    var extractAndSetErrorMsg = function extractAndSetErrorMsg(label, fieldArray) {
        var value = _$1.first(_$1.compact(_$1.map(fieldArray, function (field) {
            return _$1.first(parsedErrors[field]);
        })));

        if (value) {
            e$2(label, value);
            e$2.inlineError(label, true);
        }
    };

    extractAndSetErrorMsg("owner_document", ["user.cpf", "cpf"]);
    extractAndSetErrorMsg("country_id", ["user.country_id", "country_id"]);
    extractAndSetErrorMsg("street", ["user.address_street", "address_street"]);
    extractAndSetErrorMsg("number", ["user.address_number", "address_number"]);
    extractAndSetErrorMsg("city", ["user.address_city", "address_city"]);
    extractAndSetErrorMsg("zipcode", ["user.address_zip_code", "address_zip_code"]);
    extractAndSetErrorMsg("complement", ["user.address_complement", "address_complement"]);
    extractAndSetErrorMsg("neighbourhood", ["user.address_neighbourhood", "address_neighbourhood"]);
    extractAndSetErrorMsg("state", ["user.address_state", "address_state"]);
    extractAndSetErrorMsg("phonenumber", ["user.phone_number", "phone_number"]);
    extractAndSetErrorMsg("name", ["user.name", "name"]);
    extractAndSetErrorMsg("agency", ["user.bank_account.agency", "bank_account.agency"]);
    extractAndSetErrorMsg("agency_digit", ["user.bank_account.agency_digit", "bank_account.agency_digit"]);
    extractAndSetErrorMsg("account", ["user.bank_account.account", "bank_account.account"]);
    extractAndSetErrorMsg("account_digit", ["user.bank_account.account_digit", "bank_account.account_digit"]);
    extractAndSetErrorMsg("bank_account_type", ["user.bank_account.account_type", "bank_account.account_type"]);
    extractAndSetErrorMsg("bank_id", ["user.bank_account.bank", "bank_account.bank"]);
    extractAndSetErrorMsg("birth_date", ["user.birth_date", "birth_date"]);
    extractAndSetErrorMsg("account_type", ["user.account_type", "account_type"]);

    return e$2;
};

var userSettingsVM = {
    fields: fields$1,
    mapRailsErrors: mapRailsErrors$2
};

// import UserOwnerBox from './user-owner-box';
var I18nScope$27 = _$1.partial(h.i18nScope, 'users.edit.settings_tab');

var userSettings = {
    controller: function controller(args) {
        var parsedErrors = userSettingsVM.mapRailsErrors(railsErrorsVM.railsErrors());
        var deleteFormSubmit = void 0;
        var user = args.user,
            fields = {
            owner_document: m.prop(user.owner_document || ''),
            country_id: m.prop(user.address.country_id || 36),
            street: m.prop(user.address.street || ''),
            number: m.prop(user.address.number || ''),
            city: m.prop(user.address.city || ''),
            zipcode: m.prop(user.address.zipcode || ''),
            complement: m.prop(user.address.complement || ''),
            neighbourhood: m.prop(user.address.neighbourhood || ''),
            state: m.prop(user.address.state || ''),
            phonenumber: m.prop(user.address.phonenumber || ''),
            name: m.prop(user.name || ''),
            state_inscription: m.prop(''),
            birth_date: m.prop(user.birth_date ? h.momentify(user.birth_date) : ''),
            account_type: m.prop(user.account_type || '')
        },
            loading = m.prop(false),
            user_id = args.userId,
            error = m.prop(''),
            countries = m.prop(),
            states = m.prop(),
            loader = m.prop(true),
            showSuccess = h.toggleProp(false, true),
            showError = h.toggleProp(false, true),
            countriesLoader = postgrest$1.loader(models.country.getPageOptions()),
            statesLoader = postgrest$1.loader(models.state.getPageOptions()),
            phoneMask = _$1.partial(h.mask, '(99) 9999-99999'),
            documentMask = _$1.partial(h.mask, '999.999.999-99'),
            documentCompanyMask = _$1.partial(h.mask, '99.999.999/9999-99'),
            zipcodeMask = _$1.partial(h.mask, '99999-999'),
            birthDayMask = _$1.partial(h.mask, '99/99/9999'),
            creditCards = m.prop(),
            toDeleteCard = m.prop(-1),
            deleteCard = function deleteCard(id) {
            return function () {
                toDeleteCard(id);
                // We must redraw here to update the action output of the hidden form on the DOM.
                m.redraw(true);
                deleteFormSubmit();
                return false;
            };
        },
            setCardDeletionForm = function setCardDeletionForm(el, isInit) {
            if (!isInit) {
                deleteFormSubmit = function deleteFormSubmit() {
                    return el.submit();
                };
            }
        },
            updateUserData = function updateUserData() {
            var userData = {
                // country_id: fields.country_id(),
                country_id: 168,
                address_street: fields.street(),
                address_number: fields.number(),
                address_city: fields.city(),
                address_zip_code: fields.zipcode(),
                address_complement: fields.complement(),
                address_state: fields.state(),
                address_neighbourhood: fields.neighbourhood(),
                phone_number: fields.phonenumber(),
                cpf: fields.owner_document(),
                name: fields.name(),
                account_type: fields.account_type(),
                birth_date: fields.birth_date()
            };

            if (args.publishingUserSettings) {
                userData.publishing_user_settings = true;
            }

            return m.request({
                method: 'PUT',
                url: '/users/' + user_id + '.json',
                data: {
                    user: userData
                },
                config: h.setCsrfToken
            }).then(function () {
                if (parsedErrors) {
                    parsedErrors.resetFieldErrors();
                }
                loading(false);
                if (!showSuccess()) {
                    showSuccess.toggle();
                }
                railsErrorsVM.validatePublish();
            }).catch(function (err) {
                if (parsedErrors) {
                    parsedErrors.resetFieldErrors();
                }
                parsedErrors = userSettingsVM.mapRailsErrors(err.errors_json);
                error('Error updating info.');
                loading(false);
                if (showSuccess()) {
                    showSuccess.toggle();
                }
                if (!showError()) {
                    showError.toggle();
                }
            });
        },
            onSubmit = function onSubmit() {
            loading(true);
            m.redraw();
            updateUserData();
            return false;
        },
            applyZipcodeMask = _$1.compose(fields.zipcode, zipcodeMask),
            applyBirthDateMask = _$1.compose(fields.birth_date, birthDayMask),
            applyPhoneMask = _$1.compose(fields.phonenumber, phoneMask),
            applyDocumentMask = function applyDocumentMask(value) {
            if (fields.account_type() != 'pf') {
                fields.owner_document(documentCompanyMask(value));
            } else {
                // fields.owner_document(documentMask(value));
                fields.owner_document(value);
            }
        },
            handleError = function handleError() {
            error(true);
            loader(false);
            m.redraw();
        };

        userVM.getUserCreditCards(args.userId).then(creditCards).catch(handleError);
        countriesLoader.load().then(function (data) {
            return countries(_$1.sortBy(data, 'name_en'));
        });
        statesLoader.load().then(states);

        if (parsedErrors.hasError('country_id')) {
            parsedErrors.inlineError('country_id', false);
        }

        return {
            handleError: handleError,
            applyDocumentMask: applyDocumentMask,
            applyZipcodeMask: applyZipcodeMask,
            applyPhoneMask: applyPhoneMask,
            countries: countries,
            states: states,
            fields: fields,
            loader: loader,
            showSuccess: showSuccess,
            showError: showError,
            user: user,
            onSubmit: onSubmit,
            error: error,
            creditCards: creditCards,
            deleteCard: deleteCard,
            toDeleteCard: toDeleteCard,
            setCardDeletionForm: setCardDeletionForm,
            applyBirthDateMask: applyBirthDateMask,
            loading: loading,
            parsedErrors: parsedErrors
        };
    },
    view: function view(ctrl, args) {
        debugger;
        var user = ctrl.user,
            fields = ctrl.fields,
            hasContributedOrPublished = user.total_contributed_projects >= 1 || user.total_published_projects >= 1,
            disableFields = user.is_admin_role ? false : hasContributedOrPublished && !_$1.isEmpty(user.name) && !_$1.isEmpty(user.owner_document);

        return m('[id=\'settings-tab\']', [ctrl.showSuccess() ? m.component(popNotification, {
            message: 'Your information has been updated',
            toggleOpt: ctrl.showSuccess
        }) : '', ctrl.showError() ? m.component(popNotification, {
            message: m.trust(ctrl.error()),
            toggleOpt: ctrl.showError,
            error: true
        }) : '', m('form.w-form', {
            onsubmit: ctrl.onSubmit
        }, [m('div', [m('.w-container', m('.w-col.w-col-10.w-col-push-1',
        // ( _.isEmpty(fields.name()) && _.isEmpty(fields.owner_document()) ? '' : m(UserOwnerBox, {user: user}) ),
        m('.w-form.card.card-terciary', [
        // m('.fontsize-base.fontweight-semibold',
        //   I18n.t('legal_title', I18nScope())
        // ),
        // m('.fontsize-small.u-marginbottom-20', [
        //     m.trust(I18n.t('legal_subtitle', I18nScope()))
        // ]),
        // m('.divider.u-marginbottom-20'),
        // m('.w-row', [
        //     m('.w-col.w-col-6.w-sub-col',
        //         m('.input.select.required.user_bank_account_bank_id', [
        //             m(`select.select.required.w-input.text-field.bank-select.positive${(disableFields ? '.text-field-disabled' : '')}[id='user_bank_account_attributes_bank_id']`, {
        //                 name: 'user[bank_account_attributes][bank_id]',
        //                 onchange: m.withAttr('value', fields.account_type),
        //                 disabled: disableFields
        //             }, [
        //                 m('option[value=\'pf\']', {
        //                     selected: fields.account_type() === 'pf'
        //                 }, I18n.t('account_types.pf', I18nScope())),
        //                 m('option[value=\'pj\']', {
        //                     selected: fields.account_type() === 'pj'
        //                 }, I18n.t('account_types.pj', I18nScope())),
        //                 m('option[value=\'mei\']', {
        //                     selected: fields.account_type() === 'mei'
        //                 }, I18n.t('account_types.mei', I18nScope())),
        //             ])
        //         ])
        //     ),
        // ]),
        m('.w-row', [m('.w-col.w-col-6.w-sub-col', [m('label.text.required.field-label.field-label.fontweight-semibold.force-text-dark[for=\'user_bank_account_attributes_owner_name\']', I18n.t(fields.account_type() == 'pf' ? 'pf_label_name' : 'pj_label_name', I18nScope$27())), m('input.string.required.w-input.text-field.positive' + (disableFields ? '.text-field-disabled' : '') + '[id=\'user_bank_account_attributes_owner_name\'][type=\'text\']', {
            value: fields.name(),
            name: 'user[name]',
            class: ctrl.parsedErrors.hasError('name') ? 'error' : false,
            onchange: m.withAttr('value', fields.name),
            disabled: disableFields
        }), ctrl.parsedErrors.inlineError('name')]), m('.w-col.w-col-6', [m('.w-row', [m('.w-col.w-col-6.w-col-small-6.w-col-tiny-6.w-sub-col-middle', [m('label.text.required.field-label.field-label.fontweight-semibold.force-text-dark[for=\'user_bank_account_attributes_owner_document\']', I18n.t(fields.account_type() == 'pf' ? 'pf_label_document' : 'pj_label_document', I18nScope$27())), m('input.string.tel.required.w-input.text-field.positive' + (disableFields ? '.text-field-disabled' : '') + '[data-validate-cpf-cnpj=\'true\'][id=\'user_bank_account_attributes_owner_document\'][type=\'tel\'][validation_text=\'true\']', {
            value: fields.owner_document(),
            class: ctrl.parsedErrors.hasError('owner_document') ? 'error' : false,
            disabled: disableFields,
            name: 'user[cpf]',
            onchange: m.withAttr('value', ctrl.applyDocumentMask)
        }), ctrl.parsedErrors.inlineError('owner_document')]), m('.w-col.w-col-6.w-col-small-6.w-col-tiny-6', fields.account_type() == 'pf' ? [m('label.text.required.field-label.field-label.fontweight-semibold.force-text-dark[for=\'user_bank_account_attributes_owner_document\']', I18n.t('label_birth_date', I18nScope$27())), m('input.string.tel.required.w-input.text-field.positive' + (disableFields && !_$1.isEmpty(user.birth_date) ? '.text-field-disabled' : '') + '[data-validate-cpf-cnpj=\'true\'][id=\'user_bank_account_attributes_owner_document\'][type=\'tel\'][validation_text=\'true\']', {
            value: fields.birth_date(),
            name: 'user[birth_date]',
            placeholder: 'd/m/y',
            class: ctrl.parsedErrors.hasError('birth_date') ? 'error' : false,
            disabled: disableFields && !_$1.isEmpty(user.birth_date),
            onchange: m.withAttr('value', ctrl.applyBirthDateMask),
            onkeyup: m.withAttr('value', ctrl.applyBirthDateMask)
        }), ctrl.parsedErrors.inlineError('birth_date')] : [m('label.text.required.field-label.field-label.fontweight-semibold.force-text-dark[for=\'user_bank_account_attributes_owner_document\']', I18n.t('label_state_inscription', I18nScope$27())), m('input.string.tel.required.w-input.text-field.positive[data-validate-cpf-cnpj=\'true\'][id=\'user_bank_account_attributes_owner_document\'][type=\'tel\'][validation_text=\'true\']', {
            value: fields.state_inscription(),
            class: ctrl.parsedErrors.hasError('state_inscription') ? 'error' : false,
            name: 'user[state_inscription]',
            onchange: m.withAttr('value', fields.state_inscription)
        }), ctrl.parsedErrors.inlineError('state_inscription')])])])])]), m('.w-form.card.card-terciary.u-marginbottom-20', [m('.fontsize-base.fontweight-semibold', I18n.t('address_title', I18nScope$27())), m('.fontsize-small.u-marginbottom-20.u-marginbottom-20', [I18n.t('address_subtitle', I18nScope$27())]),
        // m('.w-row', [
        //     m('.input.select.optional.user_country.w-col.w-col-6.w-sub-col', [
        //         m('label.field-label',
        //           I18n.t('label_country', I18nScope())
        //         ),
        //         m('select.select.optional.w-input.text-field.w-select.positive[id=\'user_country_id\'][name=\'user[country_id]\']', {
        //             onchange: m.withAttr('value', fields.country_id),
        //             class: ctrl.parsedErrors.hasError('country_id') ? 'error' : false
        //         }, [
        //             m('option[value=\'\']'),
        //             (!_.isEmpty(ctrl.countries()) ?
        //                 _.map(ctrl.countries(), country => m(`option${country.id == fields.country_id() ? '[selected="selected"]' : ''}`, {
        //                     value: country.id
        //                 },
        //                     country.name_en
        //                 )) :
        //                 '')
        //         ]),
        //         ctrl.parsedErrors.inlineError('country_id')
        //     ]),
        //     m('.w-col.w-col-6')
        // ]),
        m('.w-row', [m('.input.string.optional.user_address_street.w-col.w-col-6.w-sub-col', [m('label.field-label', I18n.t('label_address_street', I18nScope$27())), m('input.string.optional.w-input.text-field.w-input.text-field.positive[data-required-in-brazil=\'true\'][id=\'user_address_street\'][name=\'user[address_street]\'][type=\'text\']', {
            value: fields.street(),
            class: ctrl.parsedErrors.hasError('street') ? 'error' : false,
            onchange: m.withAttr('value', fields.street)
        }), ctrl.parsedErrors.inlineError('street')]), m('.input.string.optional.user_address_city.w-col.w-col-6', [m('label.field-label', I18n.t('label_address_city', I18nScope$27())), m('input.string.optional.w-input.text-field.w-input.text-field.positive[data-required-in-brazil=\'true\'][id=\'user_address_city\'][name=\'user[address_city]\'][type=\'text\']', {
            value: fields.city(),
            class: ctrl.parsedErrors.hasError('city') ? 'error' : false,
            onchange: m.withAttr('value', fields.city)
        }), ctrl.parsedErrors.inlineError('city')])
        // m('.w-col.w-col-6',
        // m('.w-row', [
        // m('.input.tel.optional.user_address_number.w-col.w-col-6.w-col-small-6.w-col-tiny-6.w-sub-col-middle', [
        //     m('label.field-label',
        //       I18n.t('label_address_number', I18nScope())
        //     ),
        //     m('input.string.tel.optional.w-input.text-field.w-input.text-field.positive[id=\'user_address_number\'][name=\'user[address_number]\'][type=\'tel\']', {
        //         value: fields.number(),
        //         class: ctrl.parsedErrors.hasError('number') ? 'error' : false,
        //         onchange: m.withAttr('value', fields.number)
        //     }),
        //     ctrl.parsedErrors.inlineError('number')
        // ]),
        // m('.input.string.optional.user_address_complement.w-col.w-col-6.w-col-small-6.w-col-tiny-6', [
        //     m('label.field-label',
        //       I18n.t('label_address_complement', I18nScope())
        //     ),
        //     m('input.string.optional.w-input.text-field.w-input.text-field.positive[id=\'user_address_complement\'][name=\'user[address_complement]\'][type=\'text\']', {
        //         value: fields.complement(),
        //         class: ctrl.parsedErrors.hasError('complement') ? 'error' : false,
        //         onchange: m.withAttr('value', fields.complement)
        //     }),
        //     ctrl.parsedErrors.inlineError('complement')
        // ])
        // ])
        // )
        ]),
        // m('.w-row', [
        //     m('.input.string.optional.user_address_neighbourhood.w-col.w-col-6.w-sub-col', [
        //         m('label.field-label',
        //           I18n.t('label_address_neighbourhood', I18nScope())
        //         ),
        //         m('input.string.optional.w-input.text-field.w-input.text-field.positive[id=\'user_address_neighbourhood\'][name=\'user[address_neighbourhood]\'][type=\'text\']', {
        //             value: fields.neighbourhood(),
        //             class: ctrl.parsedErrors.hasError('neighbourhood') ? 'error' : false,
        //             onchange: m.withAttr('value', fields.neighbourhood)
        //         }),
        //         ctrl.parsedErrors.inlineError('neighbourhood')
        //     ]),
        //     m('.input.string.optional.user_address_city.w-col.w-col-6', [
        //         m('label.field-label',
        //           I18n.t('label_address_city', I18nScope())
        //         ),
        //         m('input.string.optional.w-input.text-field.w-input.text-field.positive[data-required-in-brazil=\'true\'][id=\'user_address_city\'][name=\'user[address_city]\'][type=\'text\']', {
        //             value: fields.city(),
        //             class: ctrl.parsedErrors.hasError('city') ? 'error' : false,
        //             onchange: m.withAttr('value', fields.city)
        //         }),
        //         ctrl.parsedErrors.inlineError('city')
        //     ])
        // ]),
        m('.w-row', [
        // m('.input.select.optional.user_address_state.w-col.w-col-6.w-sub-col', [
        //     m('label.field-label',
        //       I18n.t('label_address_state', I18nScope())
        //     ),
        //     m('select.select.optional.w-input.text-field.w-select.text-field.positive[data-required-in-brazil=\'true\'][id=\'user_address_state\'][name=\'user[address_state]\']', {
        //         class: ctrl.parsedErrors.hasError('state') ? 'error' : false,
        //         onchange: m.withAttr('value', fields.state)
        //     }, [
        //         m('option[value=\'\']'),
        //         (!_.isEmpty(ctrl.states()) ?
        //             _.map(ctrl.states(), state => m(`option[value='${state.acronym}']${state.acronym == fields.state() ? '[selected="selected"]' : ''}`, {
        //                 value: state.acronym
        //             },
        //                 state.name
        //             ))
        //
        //             :
        //             ''),
        //         m('option[value=\'outro / other\']',
        //           I18n.t('label_other_option', I18nScope())
        //         )
        //     ]),
        //     ctrl.parsedErrors.inlineError('state')
        // ]),
        m('.input.tel.optional.user_phone_number.w-col.w-col-6.w-col-small-6.w-col-tiny-6', [m('label.field-label', I18n.t('label_address_phone', I18nScope$27())), m('input.string.tel.optional.w-input.text-field.w-input.text-field.positive[id=\'user_phone_number\'][name=\'user[phone_number]\'][type=\'tel\']', {
            value: fields.phonenumber(),
            onchange: m.withAttr('value', fields.phonenumber),
            class: ctrl.parsedErrors.hasError('phonenumber') ? 'error' : false
        }), ctrl.parsedErrors.inlineError('phonenumber')])
        // m('.w-col.w-col-6',
        //     m('.w-row', [
        //         m('.input.tel.optional.user_address_zip_code.w-col.w-col-6.w-col-small-6.w-col-tiny-6.w-sub-col-middle', [
        //             m('label.field-label',
        //               I18n.t('label_address_zipcode', I18nScope())
        //             ),
        //             m('input.string.tel.optional.w-input.text-field.w-input.text-field.positive[data-fixed-mask=\'99999-999\'][data-required-in-brazil=\'true\'][id=\'user_address_zip_code\'][name=\'user[address_zip_code]\'][type=\'tel\']', {
        //                 value: fields.zipcode(),
        //                 class: ctrl.parsedErrors.hasError('zipcode') ? 'error' : false,
        //                 onchange: m.withAttr('value', fields.zipcode)
        //             }),
        //             ctrl.parsedErrors.inlineError('zipcode')
        //         ]),
        //         m('.input.tel.optional.user_phone_number.w-col.w-col-6.w-col-small-6.w-col-tiny-6', [
        //             m('label.field-label',
        //               I18n.t('label_address_phone', I18nScope())
        //             ),
        //             m('input.string.tel.optional.w-input.text-field.w-input.text-field.positive[data-fixed-mask=\'(99) 9999-99999\'][data-required-in-brazil=\'true\'][id=\'user_phone_number\'][name=\'user[phone_number]\'][type=\'tel\']', {
        //                 value: fields.phonenumber(),
        //                 onchange: m.withAttr('value', fields.phonenumber),
        //                 class: ctrl.parsedErrors.hasError('phonenumber') ? 'error' : false,
        //                 onkeyup: m.withAttr('value', value => ctrl.applyPhoneMask(value))
        //             }),
        //             ctrl.parsedErrors.inlineError('phonenumber')
        //         ])
        //     ])
        // )
        ])])
        // (args.hideCreditCards ? '' : m('.w-form.card.card-terciary.u-marginbottom-20', [
        //     m('.fontsize-base.fontweight-semibold',
        //       I18n.t('credit_cards.title', I18nScope())
        //     ),
        //     m('.fontsize-small.u-marginbottom-20',
        //       m.trust(
        //           I18n.t('credit_cards.subtitle', I18nScope())
        //       )
        //     ),
        //     m('.divider.u-marginbottom-20'),
        //     m('.w-row.w-hidden-tiny.card', [
        //         m('.w-col.w-col-5.w-col-small-5',
        //             m('.fontsize-small.fontweight-semibold',
        //               I18n.t('credit_cards.card_label', I18nScope())
        //             )
        //         ),
        //         m('.w-col.w-col-5.w-col-small-5',
        //             m('.fontweight-semibold.fontsize-small',
        //               I18n.t('credit_cards.provider_label', I18nScope())
        //             )
        //         ),
        //         m('.w-col.w-col-2.w-col-small-2')
        //     ]),
        //
        //     (_.map(ctrl.creditCards(), card => m('.w-row.card', [
        //         m('.w-col.w-col-5.w-col-small-5',
        //             m('.fontsize-small.fontweight-semibold', [
        //                 'XXXX XXXX XXXX',
        //                 m.trust('&nbsp;'),
        //                 card.last_digits
        //             ])
        //         ),
        //         m('.w-col.w-col-5.w-col-small-5',
        //             m('.fontsize-small.fontweight-semibold.u-marginbottom-10',
        //                 card.card_brand.toUpperCase()
        //             )
        //         ),
        //         m('.w-col.w-col-2.w-col-small-2',
        //             m('a.btn.btn-terciary.btn-small[rel=\'nofollow\']', {
        //                 onclick: ctrl.deleteCard(card.id)
        //             },
        //               I18n.t('credit_cards.remove_label', I18nScope())
        //             )
        //         )
        //     ]))),
        //     m('form.w-hidden', {
        //         action: `/en/users/${user.id}/credit_cards/${ctrl.toDeleteCard()}`,
        //         method: 'POST',
        //         config: ctrl.setCardDeletionForm
        //     }, [
        //         m('input[name=\'utf8\'][type=\'hidden\'][value=\'✓\']'),
        //         m('input[name=\'_method\'][type=\'hidden\'][value=\'delete\']'),
        //         m(`input[name='authenticity_token'][type='hidden'][value='${h.authenticityToken()}']`),
        //     ])
        // ])),
        )), m(projectEditSaveBtn, {
            loading: ctrl.loading,
            onSubmit: ctrl.onSubmit
        })])])]);
    }
};

var userNotifications = {
    controller: function controller(args) {
        var contributedProjects = m.prop(),
            projectReminders = m.prop(),
            user_id = args.userId,
            showNotifications = h.toggleProp(false, true),
            error = m.prop(false);

        userVM.getUserProjectReminders(user_id).then(projectReminders).catch(function (err) {
            error(true);
            m.redraw();
        });

        userVM.getUserContributedProjects(user_id, null).then(contributedProjects).catch(function (err) {
            error(true);
            m.redraw();
        });

        return {
            projects: contributedProjects,
            showNotifications: showNotifications,
            projectReminders: projectReminders,
            error: error
        };
    },
    view: function view(ctrl, args) {
        var user = args.user,
            reminders = ctrl.projectReminders();
        var projects_collection = ctrl.projects();

        return m('[id=\'notifications-tab\']', ctrl.error() ? m.component(inlineError, {
            message: 'Error loading page.'
        }) : m('form.simple_form.edit_user[accept-charset=\'UTF-8\'][action=\'/en/users/' + user.id + '\'][method=\'post\'][novalidate=\'novalidate\']', [m('input[name=\'utf8\'][type=\'hidden\'][value=\'✓\']'), m('input[name=\'_method\'][type=\'hidden\'][value=\'patch\']'), m('input[name=\'authenticity_token\'][type=\'hidden\'][value=\'' + h.authenticityToken() + '\']'), m('input[id=\'anchor\'][name=\'anchor\'][type=\'hidden\'][value=\'notifications\']'), m('.w-container', [m('.w-row', m('.w-col.w-col-10.w-col-push-1', m('.w-form.card.card-terciary', [m('.w-row.u-marginbottom-20', [m('.w-col.w-col-4', m('.fontweight-semibold.fontsize-small.u-marginbottom-10', 'Newsletters:')), m('.w-col.w-col-8', m('.w-checkbox.w-clearfix', [m('input[name=user[newsletter]][type=\'hidden\'][value=\'0\']'), m('input.w-checkbox-input' + (user.newsletter ? '[checked=\'checked\']' : '') + '[id=\'user_newsletter\'][name=user[newsletter]][type=\'checkbox\'][value=\'1\']'), m('label.w-form-label.fontsize-base.fontweight-semibold[for=\'checkbox\']', ' Grasruts Newsletter (weekly)'), m('div', ['Featured Projects and Blog Posts', m.trust('&nbsp;')])]))]), m('.w-row.u-marginbottom-20', [m('.w-col.w-col-4', m('.fontweight-semibold.fontsize-small.u-marginbottom-10', 'Projects you have supported:')), m('.w-col.w-col-8', m('.w-checkbox.w-clearfix', [m('input[name=user[subscribed_to_project_posts]][type=\'hidden\'][value=\'0\']'), m('input.w-checkbox-input' + (user.subscribed_to_project_posts ? '[checked=\'checked\']' : '') + '[id=\'user_subscribed_to_project_posts\'][name=user[subscribed_to_project_posts]][type=\'checkbox\'][value=\'1\']'), m('label.w-form-label.fontsize-base.fontweight-semibold', ' I want to receive project updates'), m('.u-marginbottom-20', m('a.alt-link[href=\'javascript:void(0);\']', {
            onclick: ctrl.showNotifications.toggle
        }, ' Manage notifications from ' + user.total_contributed_projects + ' projects')), ctrl.showNotifications() ? m('ul.w-list-unstyled.u-radius.card.card-secondary[id=\'notifications-box\']', [!_$1.isEmpty(projects_collection) ? _$1.map(projects_collection, function (project) {
            return m('li', m('.w-checkbox.w-clearfix', [m('input[id=\'unsubscribes_' + project.project_id + '\'][type=\'hidden\'][value=\'\']', {
                name: 'unsubscribes[' + project.project_id + ']'
            }), m('input.w-checkbox-input' + (project.unsubscribed ? '' : '[checked=\'checked\']') + '[type=\'checkbox\'][value=\'1\'][id=\'user_unsubscribes_' + project.project_id + '\']', {
                name: 'unsubscribes[' + project.project_id + ']'
            }), m('label.w-form-label.fontsize-small', project.project_name)]));
        }) : '']) : '']))]), m('.w-row.u-marginbottom-20', [m('.w-col.w-col-4', m('.fontweight-semibold.fontsize-small.u-marginbottom-10', 'Social:')), m('.w-col.w-col-8', m('.w-checkbox.w-clearfix', [m('input[name=user[subscribed_to_friends_contributions]][type=\'hidden\'][value=\'0\']'), m('input.w-checkbox-input' + (user.subscribed_to_friends_contributions ? '[checked=\'checked\']' : '') + '[id=\'user_subscribed_to_friends_contributions\'][name=user[subscribed_to_friends_contributions]][type=\'checkbox\'][value=\'1\']'), m('label.w-form-label.fontsize-small', 'A friend supported or launched a project')])), m('.w-col.w-col-8', m('.w-checkbox.w-clearfix', [m('input[name=user[subscribed_to_new_followers]][type=\'hidden\'][value=\'0\']'), m('input.w-checkbox-input' + (user.subscribed_to_new_followers ? '[checked=\'checked\']' : '') + '[id=\'user_subscribed_to_new_followers\'][name=user[subscribed_to_new_followers]][type=\'checkbox\'][value=\'1\']'), m('label.w-form-label.fontsize-small', 'A friend started following me.')]))]), m('.w-row.u-marginbottom-20', [m('.w-col.w-col-4', m('.fontweight-semibold.fontsize-small.u-marginbottom-10', 'Project Reminders:')), m('.w-col.w-col-8', [!_$1.isEmpty(reminders) ? _$1.map(reminders, function (reminder) {
            return m('.w-checkbox.w-clearfix', [m('input[id=\'user_reminders_' + reminder.project_id + '\'][type=\'hidden\'][value=\'false\']', {
                name: 'user[reminders][' + reminder.project_id + ']'
            }), m('input.w-checkbox-input[checked=\'checked\'][type=\'checkbox\'][value=\'1\'][id=\'user_reminders_' + reminder.project_id + '\']', {
                name: 'user[reminders][' + reminder.project_id + ']'
            }), m('label.w-form-label.fontsize-small', reminder.project_name)]);
        }) : ''])])]))), m('.u-margintop-30', m('.w-container', m('.w-row', m('.w-col.w-col-4.w-col-push-4', m('input.btn.btn-large[id=\'save\'][name=\'commit\'][type=\'submit\'][value=\'Save\']')))))])]));
    }
};

var UserOwnerBox = {
    view: function view(ctrl, args) {
        var project = args.project,
            user = args.user;

        return m('.card.card-terciary.u-radius.u-marginbottom-40', [m('.w-row', [args.hideAvatar ? '' : m('.w-col.w-col-2.w-col-small-2.w-col-tiny-2.w-hidden-tiny', [m('img.thumb.u-margintop-10.u-round[src="' + h.useAvatarOrDefault(user.profile_img_thumbnail) + '"][width="100"]')]), m('.w-col.w-col-10.w-col-small-10.w-col-tiny-10', [m('.fontcolor-secondary.fontsize-smallest.u-marginbottom-10', [project ? 'Supporter data ' : 'User data ', m('a.alt-link[href="/not-my-account' + (project ? '?project_id=' + project.project_id : '') + '"]', 'No, and you?')]), m('.fontsize-base.fontweight-semibold', user.name), m('label.field-label', 'CPF/CNPJ: ' + user.owner_document)])])]);
    }
};

var userBankForm = {
    controller: function controller(args) {
        var parsedErrors = args.parsedErrors;
        var fields = args.fields,
            user = args.user,
            bankAccount = m.prop({}),
            banks = m.prop(),
            banksLoader = postgrest$1.loader(models.bank.getPageOptions()),
            showOtherBanks = h.toggleProp(false, true),
            showOtherBanksInput = m.prop(false),
            popularBanks = [{
            id: '51',
            code: '001',
            name: 'Banco do Brasil S.A.'
        }, {
            id: '131',
            code: '341',
            name: 'Itaú Unibanco S.A.'
        }, {
            id: '122',
            code: '104',
            name: 'Caixa Econômica Federal'
        }, {
            id: '104',
            code: '033',
            name: 'Banco Santander  (Brasil)  S.A.'
        }, {
            id: '127',
            code: '399',
            name: 'HSBC Bank Brasil S.A. - Banco Múltiplo'
        }, {
            id: '23',
            code: '237',
            name: 'Banco Bradesco S.A.'
        }];

        userVM.getUserBankAccount(user.id).then(function (data) {
            if (!_$1.isEmpty(_$1.first(data))) {
                bankAccount(_$1.first(data));
                fields.bank_account_id(bankAccount().bank_account_id);
                fields.account(bankAccount().account);
                fields.account_digit(bankAccount().account_digit);
                fields.agency(bankAccount().agency);
                fields.agency_digit(bankAccount().agency_digit);
                fields.bank_id(bankAccount().bank_id);
                fields.bank_account_type(bankAccount().account_type);
                args.bankCode(bankAccount().bank_id);
            } else {
                fields.bank_account_type('conta_corrente');
            }
        });
        banksLoader.load().then(banks);

        return {
            bankInput: args.bankInput,
            bankCode: args.bankCode,
            banks: banks,
            banksLoader: banksLoader,
            showOtherBanksInput: showOtherBanksInput,
            showOtherBanks: showOtherBanks,
            popularBanks: popularBanks,
            bankAccount: bankAccount,
            parsedErrors: parsedErrors
        };
    },
    view: function view(ctrl, args) {
        var user = args.user,
            fields = args.fields,
            bankAccount = ctrl.bankAccount();
        return m('div', [m('.w-row', [m('.w-col.w-col-5.w-sub-col' + (ctrl.showOtherBanksInput() ? '.w-hidden' : '') + '[id=\'bank_select\']', m('.input.select.required.user_bank_account_bank_id', [m('label.field-label.fontsize-smaller', 'Banco'), m('select.select.required.w-input.text-field.bank-select.positive[id=\'user_bank_account_attributes_bank_id\']', {
            name: 'user[bank_account_attributes][bank_id]',
            class: ctrl.parsedErrors.hasError('bank_id') ? 'error' : false,
            onchange: function onchange(e) {
                m.withAttr('value', ctrl.bankCode)(e);
                ctrl.showOtherBanksInput(ctrl.bankCode() == '0');
            }
        }, [m('option[value=\'\']', {
            selected: fields.bank_id() === ''
        }), _$1.map(ctrl.popularBanks, function (bank) {
            return fields.bank_id() != bank.id ? m('option[value=\'' + bank.id + '\']', {
                selected: fields.bank_id() == bank.id
            }, bank.code + ' . ' + bank.name) : '';
        }), fields.bank_id() === '' || _$1.find(ctrl.popularBanks, function (bank) {
            return bank.id === fields.bank_id();
        }) ? '' : m('option[value=\'' + fields.bank_id() + '\']', {
            selected: true
        }, bankAccount.bank_code + ' . ' + bankAccount.bank_name), m('option[value=\'0\']', 'Outro')]), m('.fontsize-smaller.text-error.u-marginbottom-20.fa.fa-exclamation-triangle.w-hidden[data-error-for=\'user_bank_account_attributes_bank_id\']', ' Selecione um banco'), ctrl.parsedErrors.inlineError('bank_id')])), ctrl.showOtherBanksInput() ? m('.w-col.w-col-5.w-sub-col', m('.w-row.u-marginbottom-20[id=\'bank_search\']', m('.w-col.w-col-12', [m('.input.string.optional.user_bank_account_input_bank_number', [m('label.field-label.fontsize-smaller', 'Número do banco (3 números)'), m('input.string.optional.w-input.text-field.bank_account_input_bank_number[id=\'user_bank_account_attributes_input_bank_number\'][maxlength=\'3\'][size=\'3\'][type=\'text\']', {
            name: 'user[bank_account_attributes][input_bank_number]',
            value: ctrl.bankInput(),
            onchange: m.withAttr('value', ctrl.bankInput)
        }), m('.fontsize-smaller.text-error.u-marginbottom-20.fa.fa-exclamation-triangle.w-hidden[data-error-for=\'user_bank_account_attributes_input_bank_number\']', ' Número do banco inválido')]), m('a.w-hidden-small.w-hidden-tiny.alt-link.fontsize-smaller[href=\'javascript:void(0);\'][id=\'show_bank_list\']', {
            onclick: ctrl.showOtherBanks.toggle
        }, ['Busca por nome  ', m.trust('&nbsp;'), m.trust('&gt;')]), m('a.w-hidden-main.w-hidden-medium.alt-link.fontsize-smaller[href=\'javascript:void(0);\'][id=\'show_bank_list\']', {
            onclick: ctrl.showOtherBanks.toggle
        }, ['Busca por nome  ', m.trust('&nbsp;'), m.trust('&gt;')])]))) : '', ctrl.showOtherBanks() ? m('.w-row[id=\'bank_search_list\']', m('.w-col.w-col-12', m('.select-bank-list[data-ix=\'height-0-on-load\']', {
            style: {
                height: '395px'
            }
        }, m('.card.card-terciary', [m('.fontsize-small.fontweight-semibold.u-marginbottom-10.u-text-center', 'Selecione o seu banco abaixo'), m('.fontsize-smaller', [m('.w-row.card.card-secondary.fontweight-semibold', [m('.w-col.w-col-3.w-col-small-3.w-col-tiny-3', m('div', 'Número')), m('.w-col.w-col-9.w-col-small-9.w-col-tiny-9', m('div', 'Nome'))]), !_$1.isEmpty(ctrl.banks()) ? _$1.map(ctrl.banks(), function (bank) {
            return m('.w-row.card.fontsize-smallest', [m('.w-col.w-col-3.w-col-small-3.w-col-tiny-3', m('a.link-hidden.bank-resource-link[data-code=\'' + bank.code + '\'][data-id=\'' + bank.id + '\'][href=\'javascript:void(0)\']', {
                onclick: function onclick() {
                    ctrl.bankInput(bank.code);
                    ctrl.showOtherBanks.toggle();
                }
            }, bank.code)), m('.w-col.w-col-9.w-col-small-9.w-col-tiny-9', m('a.link-hidden.bank-resource-link[data-code=\'' + bank.code + '\'][data-id=\'' + bank.id + '\'][href=\'javascript:void(0)\']', {
                onclick: function onclick() {
                    ctrl.bankInput(bank.code);
                    ctrl.showOtherBanks.toggle();
                }
            }, bank.code + ' . ' + bank.name))]);
        }) : ''])])))) : '', m('.w-col.w-col-7', m('.w-row', [m('.w-col.w-col-7.w-col-small-7.w-col-tiny-7.w-sub-col-middle', [m('label.text.required.field-label.field-label.fontweight-semibold.force-text-dark.fontsize-smaller[for=\'user_bank_account_attributes_agency\']', 'Agência'), m('input.string.required.w-input.text-field.positive[id=\'user_bank_account_attributes_agency\'][type=\'text\']', {
            value: fields.agency(),
            class: ctrl.parsedErrors.hasError('agency') ? 'error' : false,
            name: 'user[bank_account_attributes][agency]',
            onchange: m.withAttr('value', fields.agency)
        }), ctrl.parsedErrors.inlineError('agency')]), m('.w-col.w-col-5.w-col-small-5.w-col-tiny-5', [m('label.text.optional.field-label.field-label.fontweight-semibold.force-text-dark.fontsize-smaller[for=\'user_bank_account_attributes_agency_digit\']', 'Dígito agência'), m('input.string.optional.w-input.text-field.positive[id=\'user_bank_account_attributes_agency_digit\'][type=\'text\']', {
            value: fields.agency_digit(),
            class: ctrl.parsedErrors.hasError('agency_digit') ? 'error' : false,
            name: 'user[bank_account_attributes][agency_digit]',
            onchange: m.withAttr('value', fields.agency_digit)
        }), ctrl.parsedErrors.inlineError('agency_digit')])]))]), m('.w-row', [m('.w-col.w-col-5.w-sub-col', [m('label.field-label.fontweight-semibold.fontsize-smaller', 'Tipo de conta'), m('.input.select.required.user_bank_account_account_type', [m('select.select.required.w-input.text-field.bank-select.positive[id=\'user_bank_account_attributes_account_type\']', {
            name: 'user[bank_account_attributes][account_type]',
            class: ctrl.parsedErrors.hasError('account_type') ? 'error' : false,
            onchange: m.withAttr('value', fields.bank_account_type)
        }, [m('option[value=\'conta_corrente\']', {
            selected: fields.bank_account_type() === 'conta_corrente'
        }, 'Conta corrente'), m('option[value=\'conta_poupanca\']', {
            Selected: fields.bank_account_type() === 'conta_poupanca'
        }, 'Conta poupança'), m('option[value=\'conta_corrente_conjunta\']', {
            selected: fields.bank_account_type() === 'conta_corrente_conjunta'
        }, 'Conta corrente conjunta'), m('option[value=\'conta_poupanca_conjunta\']', {
            selected: fields.bank_account_type() === 'conta_poupanca_conjunta'
        }, 'Conta poupança conjunta')]), ctrl.parsedErrors.inlineError('account_type')])]), m('.w-col.w-col-7', m('.w-row', [m('.w-col.w-col-7.w-col-small-7.w-col-tiny-7.w-sub-col-middle', [m('label.text.required.field-label.field-label.fontweight-semibold.force-text-dark.fontsize-smaller[for=\'user_bank_account_attributes_account\']', 'No. da conta'), m('input.string.required.w-input.text-field.positive[id=\'user_bank_account_attributes_account\'][type=\'text\']', {
            value: fields.account(),
            class: ctrl.parsedErrors.hasError('account') ? 'error' : false,
            onchange: m.withAttr('value', fields.account),
            name: 'user[bank_account_attributes][account]'
        }), ctrl.parsedErrors.inlineError('account')]), m('.w-col.w-col-5.w-col-small-5.w-col-tiny-5', [m('label.text.required.field-label.field-label.fontweight-semibold.force-text-dark.fontsize-smaller[for=\'user_bank_account_attributes_account_digit\']', 'Dígito conta'), m('input.string.required.w-input.text-field.positive[id=\'user_bank_account_attributes_account_digit\'][type=\'text\']', {
            value: fields.account_digit(),
            class: ctrl.parsedErrors.hasError('account_digit') ? 'error' : false,
            onchange: m.withAttr('value', fields.account_digit),
            name: 'user[bank_account_attributes][account_digit]'
        }), ctrl.parsedErrors.inlineError('account_digit')])]))]), bankAccount.bank_account_id ? m('input[id=\'user_bank_account_attributes_id\'][type=\'hidden\']', {
            name: 'user[bank_account_attributes][id]',
            value: fields.bank_account_id()
        }) : '']);
    }
};

/**
 * window.c.UserBalanceRequestModalContent component
 * Render the current user bank account to confirm fund request
 *
 * Example:
 * m.component(c.UserBalanceRequestModelContent, {
 *     balance: {user_id: 123, amount: 123} // userBalance struct
 * })
 */
var I18nScope$29 = _$1.partial(h.i18nScope, 'users.balance');

var userBalanceRequestModelContent = {
    controller: function controller(args) {
        var _ref;

        var parsedErrors = userSettingsVM.mapRailsErrors(args.rails_errors);

        var fields = {
            agency: m.prop(''),
            bank_id: m.prop(''),
            agency_digit: m.prop(''),
            account: m.prop(''),
            account_digit: m.prop(''),
            bank_account_id: m.prop(''),
            bank_account_type: m.prop('')
        };

        var bankAccounts = m.prop([]);

        var bankInput = m.prop(''),
            bankCode = m.prop('-1'),
            vm = postgrest.filtersVM({ user_id: 'eq' }),
            balance = args.balance,
            loaderOpts = models.balanceTransfer.postOptions({
            user_id: balance.user_id }),
            requestLoader = postgrest.loaderWithToken(loaderOpts),
            loading = m.prop(false),
            displayDone = h.toggleProp(false, true),
            displayConfirmation = h.toggleProp(false, true),
            updateUserData = function updateUserData(user_id) {
            var userData = {};
            userData.bank_account_attributes = {
                bank_id: bankCode(),
                input_bank_number: bankInput(),
                agency_digit: fields.agency_digit(),
                agency: fields.agency(),
                account: fields.account(),
                account_digit: fields.account_digit(),
                account_type: fields.bank_account_type()
            };

            if (fields.bank_account_id()) {
                userData.bank_account_attributes.id = fields.bank_account_id().toString();
            }

            loading(true);
            m.redraw();
            return m.request({
                method: 'PUT',
                url: '/users/' + user_id + '.json',
                data: { user: userData },
                config: h.setCsrfToken
            }).then(function (data) {
                if (parsedErrors) {
                    parsedErrors.resetFieldErrors();
                }

                userVM.getUserBankAccount(user_id).then(bankAccounts);
                loading(false);
                displayConfirmation(true);
                m.redraw();
            }).catch(function (err) {
                if (parsedErrors) {
                    parsedErrors.resetFieldErrors();
                }
                parsedErrors = userSettingsVM.mapRailsErrors(err.errors_json);
                loading(false);
                m.redraw();
            });
        },
            requestFund = function requestFund() {
            requestLoader.load().then(function (data) {
                args.balanceManager.load();
                args.balanceTransactionManager.load();
                displayConfirmation(false);
                displayDone.toggle();
                m.redraw();
            });
        };

        return _ref = {
            loading: loading,
            requestLoader: requestLoader,
            requestFund: requestFund,
            bankAccounts: bankAccounts,
            displayDone: displayDone,
            displayConfirmation: displayConfirmation,
            loadBankA: args.bankAccountManager.loader,
            updateUserData: updateUserData
        }, defineProperty(_ref, 'requestFund', requestFund), defineProperty(_ref, 'parsedErrors', parsedErrors), defineProperty(_ref, 'fields', fields), defineProperty(_ref, 'bankInput', bankInput), defineProperty(_ref, 'bankCode', bankCode), _ref;
    },
    view: function view(ctrl, args) {
        var balance = args.balance,
            fields = ctrl.fields,
            user = args.user;

        return m('div', [m('.modal-dialog-header', [m('.fontsize-large.u-text-center', I18n$1.t('withdraw', I18nScope$29()))]), ctrl.displayConfirmation() ? m('.modal-dialog-content.u-text-center', ctrl.loadBankA() ? h.loader() : _$1.map(ctrl.bankAccounts(), function (item) {
            return [m('.fontsize-base.u-marginbottom-20', [m('span.fontweight-semibold', I18n$1.t('value_text', I18nScope$29()) + ':'), m.trust('&nbsp;'), m('span.text-success', I18n$1.t('shared.currency', { amount: h.formatNumber(balance.amount, 2, 3) }))]), m('.fontsize-base.u-marginbottom-10', [m('span', { style: { 'font-weight': ' 600' } }, I18n$1.t('bank.account', I18nScope$29()))]), m('.fontsize-small.u-marginbottom-10', [m('div', [m('span.fontcolor-secondary', I18n$1.t('bank.name', I18nScope$29())), m.trust('&nbsp;'), item.owner_name]), m('div', [m('span.fontcolor-secondary', I18n$1.t('bank.cpf_cnpj', I18nScope$29())), m.trust('&nbsp;'), item.owner_document]), m('div', [m('span.fontcolor-secondary', I18n$1.t('bank.bank_name', I18nScope$29())), m.trust('&nbsp;'), item.bank_name]), m('div', [m('span.fontcolor-secondary', I18n$1.t('bank.agency', I18nScope$29())), m.trust('&nbsp;'), item.agency + '-' + item.agency_digit]), m('div', [m('span.fontcolor-secondary', I18n$1.t('bank.account', I18nScope$29())), m.trust('&nbsp;'), item.account + '-' + item.account_digit])])];
        })) : ctrl.displayDone() ? m('.modal-dialog-content.u-text-center', [m('.fa.fa-check-circle.fa-5x.text-success.u-marginbottom-40'), m('p.fontsize-large', I18n$1.t('success_message', I18nScope$29()))]) : m('.modal-dialog-content', [m('.fontsize-base.u-marginbottom-20', [m('span.fontweight-semibold', I18n$1.t('value_text', I18nScope$29()) + ':'), m.trust('&nbsp;'), m('span.text-success', I18n$1.t('shared.currency', { amount: h.formatNumber(balance.amount, 2, 3) }))]), m(UserOwnerBox, { user: args.user, hideAvatar: true }), m(userBankForm, { user: args.user, parsedErrors: ctrl.parsedErrors, fields: ctrl.fields, bankCode: ctrl.bankCode, bankInput: ctrl.bankInput })]), ctrl.displayConfirmation() ? m('.modal-dialog-nav-bottom', { style: 'position: relative' }, [m('.w-row', [m('.w-col.w-col-1'), m('.w-col.w-col-5', ctrl.requestLoader() || ctrl.loading() ? h.loader() : [m('a.btn.btn-medium.btn-request-fund[href="js:void(0);"]', { onclick: function onclick() {
                return ctrl.requestFund();
            } }, I18n$1.t('shared.confirm_text'))]), m('.w-col.w-col-5', ctrl.requestLoader() || ctrl.loading() ? '' : [m('a.btn.btn-medium.btn-terciary.w-button', {
            onclick: ctrl.displayConfirmation.toggle
        }, I18n$1.t('shared.back_text'))]), m('.w-col.w-col-1')])]) : '', !ctrl.displayConfirmation() && !ctrl.displayDone() ? m('.modal-dialog-nav-bottom', { style: 'position: relative;' }, [m('.w-row', [m('.w-col.w-col-3'), m('.w-col.w-col-6', [ctrl.requestLoader() || ctrl.loading() ? h.loader() : m('a.btn.btn-large.btn-request-fund[href="js:void(0);"]', { onclick: function onclick() {
                return ctrl.updateUserData(args.user.id);
            } }, I18n$1.t('request_fund', I18nScope$29()))]), m('.w-col.w-col-3')])]) : '']);
    }
};

/**
 * window.c.UserBalance component
 * Render the current user total balance and request fund action
 *
 * Example:
 * m.component(c.UserBalance, {
 *     user_id: 123,
 * })
 */
var I18nScope$28 = _$1.partial(h.i18nScope, 'users.balance');

var userBalance = {
    controller: function controller(args) {
        args.balanceManager.load();

        return {
            userBalances: args.balanceManager.collection,
            displayModal: h.toggleProp(false, true)
        };
    },
    view: function view(ctrl, args) {
        var balance = _$1.first(ctrl.userBalances()) || { user_id: args.user_id, amount: 0 },
            balanceRequestModalC = [userBalanceRequestModelContent, _$1.extend({}, { balance: balance }, args)];

        return m('.w-section.section.user-balance-section', [ctrl.displayModal() ? m.component(modalBox, {
            displayModal: ctrl.displayModal,
            content: balanceRequestModalC
        }) : '', m('.w-container', [m('.w-row', [m('.w-col.w-col-8.u-text-center-small-only.u-marginbottom-20', [m('.fontsize-larger', [I18n.t('totals', I18nScope$28()), m('span.text-success', 'Rs ' + h.formatNumber(balance.amount, 2, 3))])]), m('.w-col.w-col-4', [m('a[class="r-fund-btn w-button btn btn-medium u-marginbottom-10 ' + (balance.amount <= 0 ? 'btn-inactive' : '') + '"][href="js:void(0);"]', { onclick: balance.amount > 0 ? ctrl.displayModal.toggle : 'js:void(0);' }, I18n.t('withdraw_cta', I18nScope$28()))])])])]);
    }
};

var I18nScope$30 = _.partial(h.i18nScope, 'users.balance');

var userBalanceTrasactionRow = {
    controller: function controller(args) {
        var expanded = h.toggleProp(false, true);

        if (args.index == 0) {
            expanded.toggle();
        }

        return {
            expanded: expanded
        };
    },
    view: function view(ctrl, args) {
        var item = args.item,
            createdAt = h.momentFromString(item.created_at, 'YYYY-MM-DD');

        return m('div[class=\'balance-card ' + (ctrl.expanded() ? 'card-detailed-open' : '') + '\']', m('.w-clearfix.card.card-clickable', [m('.w-row', [m('.w-col.w-col-2.w-col-tiny-2', [m('.fontsize-small.lineheight-tightest', createdAt.format('D MMM')), m('.fontsize-smallest.fontcolor-terciary', createdAt.format('YYYY'))]), m('.w-col.w-col-10.w-col-tiny-10', [m('.w-row', [m('.w-col.w-col-4', [m('div', [m('span.fontsize-smaller.fontcolor-secondary', I18n.t('debit', I18nScope$30())), m.trust('&nbsp;'), m('span.fontsize-base.text-error', 'Rs ' + h.formatNumber(Math.abs(item.debit), 2, 3))])]), m('.w-col.w-col-4', [m('div', [m('span.fontsize-smaller.fontcolor-secondary', I18n.t('credit', I18nScope$30())), m.trust('&nbsp;'), m('span.fontsize-base.text-success', 'Rs ' + h.formatNumber(item.credit, 2, 3))])]), m('.w-col.w-col-4', [m('div', [m('span.fontsize-smaller.fontcolor-secondary', I18n.t('totals', I18nScope$30())), m.trust('&nbsp;'), m('span.fontsize-base', 'Rs ' + h.formatNumber(item.total_amount, 2, 3))])])])])]), m('a.w-inline-block.arrow-admin.' + (ctrl.expanded() ? 'arrow-admin-opened' : '') + '.fa.fa-chevron-down.fontcolor-secondary[href="js:(void(0));"]', { onclick: ctrl.expanded.toggle })]), ctrl.expanded() ? m('.card', _.map(item.source, function (transaction) {
            var pos = transaction.amount >= 0;

            return m('div', [m('.w-row.fontsize-small.u-marginbottom-10', [m('.w-col.w-col-2', [m('.text-' + (pos ? 'success' : 'error'), (pos ? '+' : '-') + ' Rs ' + h.formatNumber(Math.abs(transaction.amount), 2, 3))]), m('.w-col.w-col-10', [m('div', I18n.t('event_names.' + transaction.event_name, I18nScope$30({
                service_fee: transaction.origin_objects.service_fee ? transaction.origin_objects.service_fee * 100.0 : '',
                project_name: transaction.origin_objects.project_name,
                contributitor_name: transaction.origin_objects.contributor_name
            })))])]), m('.divider.u-marginbottom-10')]);
        })) : '');
    }
};

var userBalanceTransactions = {
    controller: function controller(args) {
        args.balanceTransactionManager.load();

        return {
            list: args.balanceTransactionManager.list
        };
    },
    view: function view(ctrl, args) {
        var list = ctrl.list;

        return m('.w-section.section.card-terciary.before-footer.balance-transactions-area', [m('.w-container', _$1.map(list.collection(), function (item, index) {
            return m.component(userBalanceTrasactionRow, { item: item, index: index });
        })), m('.container', [m('.w-row.u-margintop-40', [m('.w-col.w-col-2.w-col-push-5', [!list.isLoading() ? list.isLastPage() ? '' : m('button#load-more.btn.btn-medium.btn-terciary', {
            onclick: list.nextPage
        }, 'Load more') : h.loader()])])])]);
    }
};

/**
 * window.c.userBalanceMain component
 * A root component to show user balance and transactions
 *
 * Example:
 * To mount this component just create a DOM element like:
 * <div data-mithril="UsersBalance" data-parameters="{'user_id': 10}">
 */
var userBalanceMain = {
    controller: function controller(args) {
        var userIdVM = postgrest$1.filtersVM({ user_id: 'eq' });

        userIdVM.user_id(args.user_id);

        // Handles with user balance request data
        var balanceManager = function () {
            var collection = m.prop([{ amount: 0, user_id: args.user_id }]),
                load = function load() {
                models.balance.getRowWithToken(userIdVM.parameters()).then(collection);
            };

            return {
                collection: collection,
                load: load
            };
        }(),


        // Handles with user balance transactions list data
        balanceTransactionManager = function () {
            var listVM = postgrest$1.paginationVM(models.balanceTransaction, 'created_at.desc'),
                load = function load() {
                listVM.firstPage(userIdVM.parameters());
            };

            return {
                load: load,
                list: listVM
            };
        }(),


        // Handles with bank account to check
        bankAccountManager = function () {
            var collection = m.prop([]),
                loader = function () {
                return postgrest$1.loaderWithToken(models.bankAccount.getRowOptions(userIdVM.parameters()));
            }(),
                load = function load() {
                loader.load().then(collection);
            };

            return {
                collection: collection,
                load: load,
                loader: loader
            };
        }();

        return {
            bankAccountManager: bankAccountManager,
            balanceManager: balanceManager,
            balanceTransactionManager: balanceTransactionManager
        };
    },
    view: function view(ctrl, args) {
        var opts = _$1.extend({}, args, ctrl);
        return m('#balance-area', [m.component(userBalance, opts), m('.divider'), m.component(userBalanceTransactions, opts), m('.u-marginbottom-40'), m('.w-section.section.card-terciary.before-footer')]);
    }
};

var usersEdit = {
    controller: function controller(args) {
        var userDetails = m.prop({}),
            userId = args.user_id.split('-')[0],
            hash = m.prop(window.location.hash),
            displayTabContent = function displayTabContent(user) {
            var tabs = {
                '#projects': m(userCreated, {
                    userId: userId,
                    showDraft: true
                }),
                '#contributions': m(userPrivateContributed, {
                    userId: userId,
                    user: user
                }),
                '#about_me': m(userAboutEdit, {
                    userId: userId,
                    user: user
                }),
                '#settings': m(userSettings, {
                    userId: userId,
                    user: user
                }),
                '#notifications': m(userNotifications, {
                    userId: userId,
                    user: user
                }),
                '#balance': m(userBalanceMain, {
                    user_id: userId,
                    userId: userId,
                    user: user
                })
            };

            hash(window.location.hash);

            if (_$1.isEmpty(hash()) || hash() === '#_=_') {
                hash('#contributions');
                return tabs['#contributions'];
            }

            return tabs[hash()];
        };

        h.redrawHashChange();
        userVM.fetchUser(userId, true, userDetails);
        return {
            displayTabContent: displayTabContent,
            hash: hash,
            userDetails: userDetails
        };
    },
    view: function view(ctrl, args) {
        var user = ctrl.userDetails();

        return m('div', [m(userHeader, {
            user: user,
            hideDetails: true
        }), !_$1.isEmpty(user) ? [m('nav.dashboard-nav.u-text-center', {
            style: {
                'z-index': '10',
                position: 'relative'
            }
        }, m('.w-container', [m('a.dashboard-nav-link' + (ctrl.hash() === '#contributions' ? '.selected' : '') + '[data-target=\'#dashboard_contributions\'][href=\'#contributions\'][id=\'dashboard_contributions_link\']', 'Backed'), m('a.dashboard-nav-link' + (ctrl.hash() === '#projects' ? '.selected' : '') + '[data-target=\'#dashboard_projects\'][href=\'#projects\'][id=\'dashboard_projects_link\']', 'Created'), m('a.dashboard-nav-link' + (ctrl.hash() === '#about_me' ? '.selected' : '') + '[data-target=\'#dashboard_about_me\'][href=\'#about_me\'][id=\'dashboard_about_me_link\']', 'About You'), m('a.dashboard-nav-link' + (ctrl.hash() === '#settings' ? '.selected' : '') + '[data-target=\'#dashboard_settings\'][href=\'#settings\'][id=\'dashboard_settings_link\']', 'Data & Address'), m('a.dashboard-nav-link' + (ctrl.hash() === '#notifications' ? '.selected' : '') + '[data-target=\'#dashboard_notifications\'][href=\'#notifications\'][id=\'dashboard_notifications_link\']', 'Notifications'),
        // m(`a.dashboard-nav-link${(ctrl.hash() === '#balance' ? '.selected' : '')}[data-target='#dashboard_balance'][href='#balance'][id='dashboard_balance_link']`,
        //   'Balance'
        //  ),
        m('a.dashboard-nav-link.u-right-big-only[href=\'/en/users/' + user.id + '\']', {
            config: m.route,
            onclick: function onclick() {
                m.route('/users/' + user.id, {
                    user_id: user.id
                });
            }
        }, 'Go to the public profile')])), m('section.section', m(ctrl.hash() == '#balance' ? '.w-section' : '.w-container', m('.w-row', user.id ? ctrl.displayTabContent(user) : h.loader())))] : '']);
    }
};

var e$3 = generateErrorInstance();

var fields$2 = {
    mode: m.prop(''),
    online_days: m.prop(''),
    goal: m.prop('')
};

var fillFields = function fillFields(data) {
    fields$2.mode(data.mode || 'aon');
    fields$2.online_days(data.online_days || '');
    fields$2.goal(data.goal);
};

var updateProject$1 = function updateProject(project_id) {
    var projectData = {
        mode: fields$2.mode(),
        online_days: fields$2.online_days(),
        goal: fields$2.goal()
    };

    return projectVM.updateProject(project_id, projectData);
};

var genClickChangeMode = function genClickChangeMode(mode) {
    return function () {
        fields$2.mode(mode);
        fields$2.online_days('');
        if (mode == 'flex') {
            e$3.inlineError('online_days', false);
        }
    };
};

var projectGoalVM = {
    fields: fields$2,
    fillFields: fillFields,
    updateProject: updateProject$1,
    e: e$3,
    genClickChangeMode: genClickChangeMode
};

var bigCard = {
    view: function view(ctrl, args) {
        var cardClass = '.card.medium.card-terciary.u-marginbottom-30';

        return m(cardClass, [m('div.u-marginbottom-30', [m('label.fontweight-semibold.fontsize-base', args.label), args.label_hint ? m('.fontsize-small', args.label_hint) : '']), m('div', args.children)]);
    }
};

var I18nScope$32 = _$1.partial(h.i18nScope, 'projects.dashboard_goal');

var projectGoalEdit = {
    controller: function controller(args) {
        var vm = projectGoalVM,
            mapErrors = [['mode', ['mode']], ['goal', ['goal']], ['online_days', ['online_days']]],
            showSuccess = h.toggleProp(false, true),
            showError = h.toggleProp(false, true),
            showModeDiff = h.toggleProp(false, true),
            showTaxesDiff = h.toggleProp(false, true),
            applyGoalMask = _$1.compose(vm.fields.goal, h.numbersOnlyMask),
            loading = m.prop(false),
            onSubmit = function onSubmit(event) {
            loading(true);
            m.redraw();
            vm.updateProject(args.projectId).then(function (data) {
                loading(false);
                vm.e.resetFieldErrors();
                if (!showSuccess()) {
                    showSuccess.toggle();
                }
                if (showError()) {
                    showError.toggle();
                }
                railsErrorsVM.validatePublish();
            }).catch(function (err) {
                if (err.errors_json) {
                    railsErrorsVM.mapRailsErrors(err.errors_json, mapErrors, vm.e);
                }
                loading(false);
                if (showSuccess()) {
                    showSuccess.toggle();
                }
                if (!showError()) {
                    showError.toggle();
                }
            });
            return false;
        };

        if (railsErrorsVM.railsErrors()) {
            railsErrorsVM.mapRailsErrors(railsErrorsVM.railsErrors(), mapErrors, vm.e);
        }
        vm.fillFields(args.project);

        return {
            onSubmit: onSubmit,
            showSuccess: showSuccess,
            showError: showError,
            showModeDiff: showModeDiff,
            showTaxesDiff: showTaxesDiff,
            vm: vm,
            applyGoalMask: applyGoalMask,
            loading: loading
        };
    },
    view: function view(ctrl, args) {
        var vm = ctrl.vm;
        return m('#goal-tab', [ctrl.showSuccess() ? m.component(popNotification, {
            message: I18n$1.t('shared.successful_update'),
            toggleOpt: ctrl.showSuccess
        }) : '', ctrl.showError() ? m.component(popNotification, {
            message: I18n$1.t('shared.failed_update'),
            toggleOpt: ctrl.showError,
            error: true
        }) : '', m('form.w-form', { onsubmit: ctrl.onSubmit }, [m('.w-container', [m('.w-row', [m('.w-col.w-col-10.w-col-push-1', [m(bigCard, {
            label: I18n$1.t('mode_label', I18nScope$32()),
            // label_hint: I18n.t('mode_hint', I18nScope()),
            children: [m('.flex-row.u-marginbottom-30', [m('a.choose-mode.choose-aon.w-inline-block.btn-select.flex-column.u-text-center[data-mode="aon"][href="javascript:void(0);"]', {
                onclick: vm.genClickChangeMode('aon'),
                class: vm.fields.mode() == 'aon' ? 'selected' : false
            }, [m('img[alt="Badge aon"][src="/assets/catarse_bootstrap/badge-aon.png"]')]), m('a.choose-mode.choose-flex.w-inline-block.btn-select.flex-column.u-text-center[data-mode="flex"][href="javascript:void(0);"]', {
                onclick: vm.genClickChangeMode('flex'),
                class: vm.fields.mode() == 'flex' ? 'selected' : false
            }, [m('img[alt="Badge flex"][src="/assets/catarse_bootstrap/badge-flex.png"]')])]), m('.u-text-center.fontsize-smaller', [m('a.mode-diff-toggle.link-hidden-light.fontweight-semibold[href="javascript:void(0);"]', { onclick: ctrl.showModeDiff.toggle }, ['See the difference between the models ', m('span.fa.fa-chevron-down')])]), ctrl.showModeDiff() ? m('.mode-diff.u-margintop-30', [m('.flex-row', [m('.w-hidden-small.w-hidden-tiny.fontsize-smaller.flex-column', m.trust(I18n$1.t('aon_diff_html', I18nScope$32()))), m('.w-hidden-small.w-hidden-tiny.fontsize-smaller.flex-column', m.trust(I18n$1.t('flex_diff_html', I18nScope$32())))])
            // m('.u-text-center.u-margintop-30', [
            //     m('.divider.u-marginbottom-20'),
            //     m('.fontsize-base', I18n.t('want_more', I18nScope())),
            //     m.trust(I18n.t('mode_diff_ebook', I18nScope()))
            // ])
            ]) : '']
        }), m(bigCard, {
            label: I18n$1.t('goal_label', I18nScope$32()),
            label_hint: I18n$1.t('goal_hint', I18nScope$32()),
            children: [m('.w-row.u-marginbottom-30', [m('.w-col.w-col-2'), m('.w-col.w-col-8', [m('.w-row', [m('.w-col.w-col-4.w-col-small-6.w-col-tiny-6.text-field.prefix.no-hover.medium.prefix-permalink', [m('.fontcolor-secondary.u-text-center.fontsize-base.lineheight-tightest', 'Rs')]), m('.w-col.w-col-8.w-col-small-6.w-col-tiny-6.label-hide', [m('.input.tel.optional.project_goal', [m('label.field-label'), m('input.string.optional.w-input.text-field.postfix.positive.medium[autocomplete="off"][id="project-goal-input"][name="project[goal]"][type="tel"]', {
                class: vm.e.hasError('goal') ? 'error' : false,
                value: vm.fields.goal(),
                maxlength: 14,
                onkeyup: m.withAttr('value', ctrl.applyGoalMask)
            })])])]), m('.u-text-center', vm.e.inlineError('goal'))]), m('.w-col.w-col-2')]), m('.u-text-center.fontsize-smaller.fontweight-semibold', [m('a.fee-toggle.link-hidden-light[href="javascript:void(0)"]', {
                onclick: ctrl.showTaxesDiff.toggle
            }, [I18n$1.t('goal_taxes_link', I18nScope$32()), m('span.fa.fa-chevron-down')])]), ctrl.showTaxesDiff() ? m('.fee-explanation.u-margintop-30', [m('.u-marginbottom-30', [m('.fontsize-small.fontweight-semibold', I18n$1.t('goal_taxes_label', I18nScope$32())), m('.fontsize-smaller', I18n$1.t('goal_' + vm.fields.mode() + '_taxes_hint', I18nScope$32()))])
            // m('.u-text-center.u-margintop-30', [
            //     m('.divider.u-marginbottom-20'),
            //     m('.fontsize-base', I18n.t('want_more', I18nScope())),
            //     m.trust(I18n.t('goal_taxes_watch_video_html', I18nScope()))
            // ])
            ]) : '']
        }), m(bigCard, {
            label: I18n$1.t('online_days_label', I18nScope$32()),
            label_hint: m.trust(I18n$1.t('online_days_' + vm.fields.mode() + '_hint', I18nScope$32())),
            children: vm.fields.mode() == 'aon' ? [m('.w-row', [m('.w-col.w-col-2'), m('.w-col.w-col-8', [m('.w-row', [m('.w-col.w-col-8.label-hide', [m('.input.integer.optional.disabled.project_online_days', [m('label.field-label'), m('input.numeric.integer.optional.disabled.w-input.text-field.postfix.positive.medium[id="project_online_days"][name="project[online_days]"][type="number"]', {
                onchange: m.withAttr('value', vm.fields.online_days),
                value: vm.fields.online_days(),
                class: vm.e.hasError('online_days') ? 'error' : false
            })])]), m('.w-col.w-col-4', [m('.text-field.medium.prefix-permalink.u-text-center', [m('', 'days')])])]), vm.e.inlineError('online_days')])])] : [m('.flex-row', [m('a.choose-time.choose-unlimited.w-inline-block.btn-select.flex-column.u-text-center', {
                class: _$1.isEmpty(vm.fields.online_days().toString()) ? 'selected' : '',
                onclick: function onclick() {
                    vm.fields.online_days('');
                }
            }, [m('.fontsize-base.fontweight-semibold.u-marginbottom-20', I18n$1.t('online_days_open', I18nScope$32())), m('.w-hidden-tiny', I18n$1.t('online_days_open_hint', I18nScope$32()))]), m('a.choose-time.choose-limited.w-inline-block.btn-select.flex-column.u-text-center', {
                class: _$1.isEmpty(vm.fields.online_days().toString()) ? '' : 'selected',
                onclick: function onclick() {
                    vm.fields.online_days(1);
                }
            }, [m('.fontsize-base.fontweight-semibold.u-marginbottom-20', I18n$1.t('online_days_closed', I18nScope$32())), m('.w-hidden-tiny.u-marginbottom-30', I18n$1.t('online_days_closed_hint', I18nScope$32())), m('.w-row', [m('.w-col.w-col-6.label-hide', [m('.input.integer.optional.project_online_days', [m('label.field-label'), m('input.numeric.integer.optional.w-input.text-field.field.w-input.text-field.medium.prefix[id="project_online_days"][name="project[online_days]"][type="number"]', {
                onchange: m.withAttr('value', vm.fields.online_days),
                value: vm.fields.online_days(),
                class: vm.e.hasError('online_days') ? 'error' : false
            })])]), m('.w-col.w-col-6', [m('.text-field.medium.prefix-permalink', {
                class: vm.e.hasError('online_days') ? 'error' : false
            }, [m('', 'days')])])]), m('.w-row', vm.e.inlineError('online_days'))])])]
        })])])]), m(projectEditSaveBtn, { loading: ctrl.loading, onSubmit: ctrl.onSubmit })])]);
    }
};

var projectEditGoal = {
    controller: function controller(args) {
        return {
            user: userVM.fetchUser(args.user_id),
            project: projectVM.fetchProject(args.project_id)
        };
    },
    view: function view(ctrl, args) {
        return ctrl.user() && ctrl.project() ? m(projectGoalEdit, {
            user: ctrl.user(),
            userId: args.user_id,
            projectId: args.project_id,
            project: ctrl.project()
        }) : m('div', h.loader());
    }
};

var e$4 = generateErrorInstance();

var fields$3 = {
    tracker_snippet_html: m.prop(''),
    user_id: m.prop(''),
    public_tags: m.prop(''),
    admin_tags: m.prop(''),
    service_fee: m.prop(''),
    name: m.prop(''),
    permalink: m.prop(''),
    category_id: m.prop(''),
    city_id: m.prop(''),
    city_name: m.prop('')
};

var fillFields$1 = function fillFields(data) {
    fields$3.tracker_snippet_html(data.tracker_snippet_html || '');
    fields$3.user_id(data.user_id);
    fields$3.admin_tags(data.admin_tag_list || '');
    fields$3.public_tags(data.tag_list || '');
    fields$3.service_fee(data.service_fee);
    fields$3.name(data.name);
    fields$3.permalink(data.permalink);
    fields$3.category_id(data.category_id);
    fields$3.city_id(data.city_id || '');
    if (data.address.city) {
        fields$3.city_name(data.address.city + ' - ' + data.address.state);
    }
};

var updateProject$2 = function updateProject(project_id) {
    var projectData = {
        tracker_snippet_html: fields$3.tracker_snippet_html(),
        user_id: fields$3.user_id(),
        all_tags: fields$3.admin_tags(),
        all_public_tags: fields$3.public_tags(),
        service_fee: fields$3.service_fee(),
        name: fields$3.name(),
        permalink: fields$3.permalink(),
        category_id: fields$3.category_id(),
        city_id: fields$3.city_id };

    return projectVM.updateProject(project_id, projectData);
};

var loadCategoriesOptionsTo = function loadCategoriesOptionsTo(prop, selected) {
    var filters = postgrest$1.filtersVM;
    models.category.getPage(filters({}).order({
        name: 'asc'
    }).parameters()).then(function (data) {
        var mapped = _$1.map(data, function (item, index) {
            return m('option[value=\'' + item.id + '\']', {
                selected: selected == item.id
            }, item.name);
        });

        prop(mapped);
    });
};

var generateSearchCity = function generateSearchCity(prop) {
    var filters = postgrest$1.filtersVM({
        search_index: 'ilike'
    }).order({ name: 'asc' });

    var genSelectClickCity = function genSelectClickCity(city, citiesProp) {
        return function () {
            fields$3.city_name(city.name + ' - ' + city.acronym);
            fields$3.city_id(city.id);
            citiesProp('');
        };
    };

    return function (event) {
        var value = event.currentTarget.value;
        filters.search_index(replaceDiacritics(value));
        fields$3.city_name(value);

        models.city.getPage(filters.parameters()).then(function (data) {
            var map = _$1.map(data, function (item) {
                return m('.table-row.fontsize-smallest.fontcolor-secondary', [m('.city-select.fontsize-smallest.link-hidden-light', {
                    onclick: genSelectClickCity(item, prop)
                }, item.name + ' - ' + item.acronym)]);
            });

            prop(m('.table-outer.search-pre-result', { style: { 'z-index': 9999 } }, map));
        }).catch(function (err) {
            prop('');
        });
    };
};

var projectBasicsVM = {
    fields: fields$3,
    fillFields: fillFields$1,
    updateProject: updateProject$2,
    loadCategoriesOptionsTo: loadCategoriesOptionsTo,
    e: e$4,
    generateSearchCity: generateSearchCity
};

var inputCard = {
    view: function view(ctrl, args) {
        var cardClass = args.cardClass || '.w-row.u-marginbottom-30.card.card-terciary',
            onclick = args.onclick || Function.prototype;

        return m(cardClass, { onclick: onclick }, [m('.w-col.w-col-5.w-sub-col', [m('label.field-label.fontweight-semibold', args.label), args.label_hint ? m('label.hint.fontsize-smallest.fontcolor-secondary', args.label_hint) : '']), m('.w-col.w-col-7.w-sub-col', args.children)]);
    }
};

var I18nScope$33 = _$1.partial(h.i18nScope, 'projects.dashboard_basics');

var projectBasicsEdit = {
    controller: function controller(args) {
        var vm = projectBasicsVM,
            mapErrors = [['name', ['name']], ['public_tags', ['public_tags']], ['permalink', ['permalink']], ['category_id', ['category']], ['city_id', ['city']]],
            loading = m.prop(false),
            cities = m.prop(),
            categories = m.prop([]),
            showSuccess = h.toggleProp(false, true),
            showError = h.toggleProp(false, true),
            selectedTags = m.prop([]),
            tagOptions = m.prop([]),
            isEditingTags = m.prop(false),
            tagEditingLoading = m.prop(false),
            onSubmit = function onSubmit() {
            if (isEditingTags()) {
                return false;
            }

            loading(true);
            m.redraw();
            var tagString = _$1.pluck(selectedTags(), 'name').join(',');
            vm.fields.public_tags(tagString);
            vm.updateProject(args.projectId).then(function () {
                loading(false);
                vm.e.resetFieldErrors();
                showSuccess(true);
                showError(false);
            }).catch(function (err) {
                if (err.errors_json) {
                    railsErrorsVM.mapRailsErrors(err.errors_json, mapErrors, vm.e);
                }
                loading(false);
                showSuccess(false);
                showError(true);
            });

            return false;
        };
        if (railsErrorsVM.railsErrors()) {
            railsErrorsVM.mapRailsErrors(railsErrorsVM.railsErrors(), mapErrors, vm.e);
        }
        vm.fillFields(args.project);

        if (vm.fields.public_tags()) {
            selectedTags(_$1.map(vm.fields.public_tags().split(','), function (name) {
                return { name: name };
            }));
        }

        vm.loadCategoriesOptionsTo(categories, vm.fields.category_id());
        var addTag = function addTag(tag) {
            return function () {
                tagOptions([]);

                if (selectedTags().length >= 5) {
                    vm.e('public_tags', I18n$1.t('tags_max_error', I18nScope$33()));
                    vm.e.inlineError('public_tags', true);
                    m.redraw();

                    return false;
                }
                selectedTags().push(tag);
                isEditingTags(false);

                m.redraw();

                return false;
            };
        };

        var removeTag = function removeTag(tagToRemove) {
            return function () {
                var updatedTags = _$1.reject(selectedTags(), function (tag) {
                    return tag === tagToRemove;
                });

                selectedTags(updatedTags);

                return false;
            };
        };
        var tagString = m.prop('');
        var transport = m.prop({ abort: Function.prototype });
        var searchTagsUrl = h.getApiHost() + '/rpc/tag_search';
        var searchTags = function searchTags() {
            return m.request({ method: 'POST', background: true, config: transport, data: { query: tagString(), count: 3 }, url: searchTagsUrl });
        };
        var triggerTagSearch = function triggerTagSearch(e) {
            tagString(e.target.value);

            isEditingTags(true);
            tagOptions([]);

            var keyCode = e.keyCode;

            if (keyCode === 188 || keyCode === 13) {
                var tag = tagString().charAt(tagString().length - 1) === ',' ? tagString().substr(0, tagString().length - 1) : tagString();

                addTag({ name: tag.toLowerCase() }).call();
                e.target.value = '';
                return false;
            }

            tagEditingLoading(true);
            transport().abort();
            searchTags().then(function (data) {
                tagOptions(data);
                tagEditingLoading(false);
                m.redraw(true);
            });

            return false;
        };

        var editTag = function editTag(el, isinit) {
            if (!isinit) {
                el.onkeyup = triggerTagSearch;
            }
        };

        return {
            vm: vm,
            onSubmit: onSubmit,
            loading: loading,
            categories: categories,
            cities: cities,
            showSuccess: showSuccess,
            showError: showError,
            tagOptions: tagOptions,
            editTag: editTag,
            addTag: addTag,
            removeTag: removeTag,
            isEditingTags: isEditingTags,
            triggerTagSearch: triggerTagSearch,
            selectedTags: selectedTags,
            tagEditingLoading: tagEditingLoading
        };
    },
    view: function view(ctrl, args) {
        var vm = ctrl.vm;

        return m('#basics-tab', [ctrl.showSuccess() ? m.component(popNotification, {
            message: I18n$1.t('shared.successful_update'),
            toggleOpt: ctrl.showSuccess
        }) : '', ctrl.showError() ? m.component(popNotification, {
            message: I18n$1.t('shared.failed_update'),
            toggleOpt: ctrl.showError,
            error: true
        }) : '',

        // add pop notifications here
        m('form.w-form', { onsubmit: ctrl.onSubmit }, [m('.w-container', [
        // admin fields
        args.user.is_admin ? m('.w-row', [m('.w-col.w-col-10.w-col-push-1', [m(inputCard, {
            label: I18n$1.t('tracker_snippet_html', I18nScope$33()),
            children: [m('textarea.text.optional.w-input.text-field.positive.medium', {
                value: vm.fields.tracker_snippet_html(),
                onchange: m.withAttr('value', vm.fields.tracker_snippet_html)
            })]
        }), m(inputCard, {
            label: I18n$1.t('user_id', I18nScope$33()),
            children: [m('input.string.optional.w-input.text-field.positive.medium[type="text"]', {
                value: vm.fields.user_id(),
                onchange: m.withAttr('value', vm.fields.user_id)
            })]
        }), m(inputCard, {
            label: I18n$1.t('admin_tags', I18nScope$33()),
            label_hint: I18n$1.t('admin_tags_hint', I18nScope$33()),
            children: [m('input.string.optional.w-input.text-field.positive.medium[type="text"]', {
                value: vm.fields.admin_tags(),
                onchange: m.withAttr('value', vm.fields.admin_tags)
            })]
        }), m(inputCard, {
            label: I18n$1.t('service_fee', I18nScope$33()),
            children: [m('input.string.optional.w-input.text-field.positive.medium[type="number"]', {
                value: vm.fields.service_fee(),
                onchange: m.withAttr('value', vm.fields.service_fee)
            })]
        })])]) : '', m('.w-row', [m('.w-col.w-col-10.w-col-push-1', [m(inputCard, {
            label: I18n$1.t('name', I18nScope$33()),
            label_hint: I18n$1.t('name_hint', I18nScope$33()),
            children: [m('input.string.required.w-input.text-field.positive.medium[type="text"][maxlength="50"]', {
                value: vm.fields.name(),
                class: vm.e.hasError('name') ? 'error' : '',
                onchange: m.withAttr('value', vm.fields.name)
            }), vm.e.inlineError('name')]
        }), m(inputCard, {
            label: I18n$1.t('tags', I18nScope$33()),
            label_hint: I18n$1.t('tags_hint', I18nScope$33()),
            onclick: function onclick() {
                return ctrl.isEditingTags(false);
            },
            children: [m('input.string.optional.w-input.text-field.positive.medium[type="text"]', {
                config: ctrl.editTag,
                class: vm.e.hasError('public_tags') ? 'error' : '',
                onfocus: function onfocus() {
                    return vm.e.inlineError('public_tags', false);
                }
            }), ctrl.isEditingTags() ? m('.options-list.table-outer', ctrl.tagEditingLoading() ? m('.dropdown-link', m('.fontsize-smallest', 'Carregando...')) : ctrl.tagOptions().length ? _$1.map(ctrl.tagOptions(), function (tag) {
                return m('.dropdown-link', { onclick: ctrl.addTag(tag) }, m('.fontsize-smaller', tag.name));
            }) : m('.dropdown-link', m('.fontsize-smallest', 'No related tags...'))) : '', vm.e.inlineError('public_tags'), m('div.tag-choices', _$1.map(ctrl.selectedTags(), function (choice) {
                return m('.tag-div', m('div', [m('a.tag-close-btn.fa.fa-times-circle', { onclick: ctrl.removeTag(choice) }), ' ' + choice.name]));
            }))]
        }), m(inputCard, {
            label: I18n$1.t('permalink', I18nScope$33()),
            label_hint: I18n$1.t('permalink_hint', I18nScope$33()),
            children: [m('.w-row', [m('.w-col.w-col-4.w-col-small-6.w-col-tiny6.text-field.prefix.no-hover.medium.prefix-permalink', {
                class: vm.e.hasError('permalink') ? 'error' : ''
            }, m('.fontcolor-secondary.u-text-center.fontcolor-secondary.u-text-center.fontsize-smallest', 'www.grasruts.com/')), m('.w-col.w-col-8.w-col-small-6.w-col-tiny-6', [m('input.string.required.w-input.text-field.postfix.positive.medium[type="text"]', {
                value: vm.fields.permalink(),
                class: vm.e.hasError('permalink') ? 'error' : '',
                onchange: m.withAttr('value', vm.fields.permalink)
            })])]), m('.w-row', vm.e.inlineError('permalink'))]
        }), m(inputCard, {
            label: I18n$1.t('category', I18nScope$33()),
            label_hint: I18n$1.t('category_hint', I18nScope$33()),
            children: [m('select.required.w-input.text-field.w-select.positive.medium', {
                value: vm.fields.category_id(),
                class: vm.e.hasError('category_id') ? 'error' : '',
                onchange: m.withAttr('value', vm.fields.category_id)
            }, ctrl.categories()), vm.e.inlineError('category_id')]
        }), m(inputCard, {
            label: I18n$1.t('city', I18nScope$33()),
            label_hint: I18n$1.t('city_hint', I18nScope$33()),
            children: [m('input.string.required.w-input.text-field.positive.medium[type="text"]', {
                value: vm.fields.city_name(),
                class: vm.e.hasError('city_id') ? 'error' : '',
                onkeyup: vm.generateSearchCity(ctrl.cities)
            }), vm.e.inlineError('city_id'), ctrl.cities()]
        })])])]), m(projectEditSaveBtn, { loading: ctrl.loading, onSubmit: ctrl.onSubmit })])]);
    }
};

var projectEditBasic = {
    controller: function controller(args) {
        return {
            user: userVM.fetchUser(args.user_id),
            project: projectVM.fetchProject(args.project_id)
        };
    },
    view: function view(ctrl, args) {
        return ctrl.user() && ctrl.project() ? m(projectBasicsEdit, {
            user: ctrl.user(),
            userId: args.user_id,
            projectId: args.project_id,
            project: ctrl.project()
        }) : m('div', h.loader());
    }
};

var e$5 = generateErrorInstance();

var fields$4 = {
    about_html: m.prop('')
};

var fillFields$2 = function fillFields(data) {
    fields$4.about_html(data.about_html || '');
};

var updateProject$3 = function updateProject(project_id) {
    var projectData = {
        about_html: fields$4.about_html()
    };

    return projectVM.updateProject(project_id, projectData);
};

var projectDescriptionVM = {
    fields: fields$4,
    fillFields: fillFields$2,
    updateProject: updateProject$3,
    e: e$5
};

var bigInputCard = {
    view: function view(ctrl, args) {
        var cardClass = args.cardClass || '.w-row.u-marginbottom-30.card.card-terciary.padding-redactor-description.text.optional.project_about_html.field_with_hint';

        return m(cardClass, { style: args.cardStyle || {} }, [m('div', [m('label.field-label.fontweight-semibold.fontsize-base', args.label), args.label_hint ? m('label.hint.fontsize-smallest.fontcolor-secondary', args.label_hint) : '']), m('div', args.children)]);
    }
};

var I18nScope$34 = _$1.partial(h.i18nScope, 'projects.dashboard_description');

var projectDescriptionEdit = {
    controller: function controller(args) {
        var vm = projectDescriptionVM,
            mapErrors = [['about_html', ['about_html']]],
            showSuccess = h.toggleProp(false, true),
            showError = h.toggleProp(false, true),
            loading = m.prop(false),
            onSubmit = function onSubmit(event) {
            loading(true);
            m.redraw();
            vm.updateProject(args.projectId).then(function (data) {
                loading(false);
                vm.e.resetFieldErrors();
                if (!showSuccess()) {
                    showSuccess.toggle();
                }
                if (showError()) {
                    showError.toggle();
                }
                railsErrorsVM.validatePublish();
            }).catch(function (err) {
                if (err.errors_json) {
                    railsErrorsVM.mapRailsErrors(err.errors_json, mapErrors, vm.e);
                }
                loading(false);
                if (showSuccess()) {
                    showSuccess.toggle();
                }
                if (!showError()) {
                    showError.toggle();
                }
            });
            return false;
        };

        if (railsErrorsVM.railsErrors()) {
            railsErrorsVM.mapRailsErrors(railsErrorsVM.railsErrors(), mapErrors, vm.e);
        }
        vm.fillFields(args.project);

        return {
            onSubmit: onSubmit,
            showSuccess: showSuccess,
            showError: showError,
            vm: vm,
            loading: loading
        };
    },
    view: function view(ctrl, args) {
        var vm = ctrl.vm;
        return m('#description-tab', [ctrl.showSuccess() ? m.component(popNotification, {
            message: I18n$1.t('shared.successful_update'),
            toggleOpt: ctrl.showSuccess
        }) : '', ctrl.showError() ? m.component(popNotification, {
            message: I18n$1.t('shared.failed_update'),
            toggleOpt: ctrl.showError,
            error: true
        }) : '', m('form.w-form', { onsubmit: ctrl.onSubmit }, [m('.w-container', [m('.w-row', [m('.w-col.w-col-10.w-col-push-1', [
        // m('.u-marginbottom-60.u-text-center', [
        //        m('.w-inline-block.card.fontsize-small.u-radius', [
        //     m.trust(I18n.t('description_alert', I18nScope()))
        //        ])
        //  ]),
        m(bigInputCard, {
            label: I18n$1.t('description_label', I18nScope$34()),
            label_hint: I18n$1.t('description_hint', I18nScope$34()),
            children: [m('.preview-container', {
                class: vm.e.hasError('about_html') ? 'error' : false
            }, h.redactor('project[about_html]', vm.fields.about_html)), vm.e.inlineError('about_html')]
        })])])]), m(projectEditSaveBtn, { loading: ctrl.loading, onSubmit: ctrl.onSubmit })])]);
    }
};

var projectEditDescription = {
    controller: function controller(args) {
        return {
            user: userVM.fetchUser(args.user_id),
            project: projectVM.fetchProject(args.project_id)
        };
    },
    view: function view(ctrl, args) {
        return ctrl.user() && ctrl.project() ? m(projectDescriptionEdit, {
            user: ctrl.user(),
            userId: args.user_id,
            projectId: args.project_id,
            project: ctrl.project()
        }) : m('div', h.loader());
    }
};

var e$6 = generateErrorInstance();

var fields$5 = {
    video_url: m.prop('')
};

var fillFields$3 = function fillFields(data) {
    fields$5.video_url(data.video_url || '');
};

var updateProject$4 = function updateProject(project_id) {
    var projectData = {
        video_url: fields$5.video_url()
    };

    return projectVM.updateProject(project_id, projectData);
};

var projectVideoVM = {
    fields: fields$5,
    fillFields: fillFields$3,
    updateProject: updateProject$4,
    e: e$6
};

var I18nScope$35 = _$1.partial(h.i18nScope, 'projects.dashboard_video');

var projectBudgetEdit = {
    controller: function controller(args) {
        var vm = projectVideoVM,
            mapErrors = [['video_url', ['video_url']]],
            showSuccess = h.toggleProp(false, true),
            showError = h.toggleProp(false, true),
            loading = m.prop(false),
            onSubmit = function onSubmit(event) {
            loading(true);
            m.redraw();
            vm.updateProject(args.projectId).then(function (data) {
                loading(false);
                vm.e.resetFieldErrors();
                if (!showSuccess()) {
                    showSuccess.toggle();
                }
                if (showError()) {
                    showError.toggle();
                }
                railsErrorsVM.validatePublish();
            }).catch(function (err) {
                if (err.errors_json) {
                    railsErrorsVM.mapRailsErrors(err.errors_json, mapErrors, vm.e);
                }
                loading(false);
                if (showSuccess()) {
                    showSuccess.toggle();
                }
                if (!showError()) {
                    showError.toggle();
                }
            });
            return false;
        };

        if (railsErrorsVM.railsErrors()) {
            railsErrorsVM.mapRailsErrors(railsErrorsVM.railsErrors(), mapErrors, vm.e);
        }
        vm.fillFields(args.project);

        return {
            onSubmit: onSubmit,
            showSuccess: showSuccess,
            showError: showError,
            vm: vm,
            loading: loading
        };
    },
    view: function view(ctrl, args) {
        var vm = ctrl.vm;
        return m('#video-tab', [ctrl.showSuccess() ? m.component(popNotification, {
            message: I18n$1.t('shared.successful_update'),
            toggleOpt: ctrl.showSuccess
        }) : '', ctrl.showError() ? m.component(popNotification, {
            message: I18n$1.t('shared.failed_update'),
            toggleOpt: ctrl.showError,
            error: true
        }) : '', m('form.w-form', { onsubmit: ctrl.onSubmit }, [m('.w-container', [m('.w-row', [m('.w-col.w-col-10.w-col-push-1', [
        // m('.u-marginbottom-60.u-text-center', [
        //        m('.w-inline-block.card.fontsize-small.u-radius', [
        //     m.trust(I18n.t('video_alert', I18nScope()))
        //        ])
        //  ]),
        m(inputCard, {
            label: I18n$1.t('video_label', I18nScope$35()),
            label_hint: I18n$1.t('video_hint', I18nScope$35()),
            children: [m('input.string.required.w-input.text-field.positive.medium[type="text"]', {
                value: vm.fields.video_url(),
                class: vm.e.hasError('video_url') ? 'error' : '',
                onchange: m.withAttr('value', vm.fields.video_url)
            }), vm.e.inlineError('video_url')]
        })])])]), m(projectEditSaveBtn, { loading: ctrl.loading, onSubmit: ctrl.onSubmit })])]);
    }
};

var projectEditVideo = {
    controller: function controller(args) {
        return {
            user: userVM.fetchUser(args.user_id),
            project: projectVM.fetchProject(args.project_id)
        };
    },
    view: function view(ctrl, args) {
        return ctrl.user() && ctrl.project() ? m(projectBudgetEdit, {
            user: ctrl.user(),
            userId: args.user_id,
            projectId: args.project_id,
            project: ctrl.project()
        }) : m('div', h.loader());
    }
};

var e$7 = generateErrorInstance();

var fields$6 = {
    budget: m.prop('')
};

var fillFields$4 = function fillFields(data) {
    fields$6.budget(data.budget || '');
};

var updateProject$5 = function updateProject(project_id) {
    var projectData = {
        budget: fields$6.budget()
    };

    return projectVM.updateProject(project_id, projectData);
};

var projectBudgetVM = {
    fields: fields$6,
    fillFields: fillFields$4,
    updateProject: updateProject$5,
    e: e$7
};

var I18nScope$36 = _$1.partial(h.i18nScope, 'projects.dashboard_budget');

var projectBudgetEdit$1 = {
    controller: function controller(args) {
        var vm = projectBudgetVM,
            mapErrors = [['budget', ['budget']]],
            showSuccess = h.toggleProp(false, true),
            showError = h.toggleProp(false, true),
            loading = m.prop(false),
            onSubmit = function onSubmit(event) {
            loading(true);
            m.redraw();
            vm.updateProject(args.projectId).then(function (data) {
                loading(false);
                vm.e.resetFieldErrors();
                if (!showSuccess()) {
                    showSuccess.toggle();
                }
                if (showError()) {
                    showError.toggle();
                }
                railsErrorsVM.validatePublish();
            }).catch(function (err) {
                if (err.errors_json) {
                    railsErrorsVM.mapRailsErrors(err.errors_json, mapErrors, vm.e);
                }
                loading(false);
                if (showSuccess()) {
                    showSuccess.toggle();
                }
                if (!showError()) {
                    showError.toggle();
                }
            });
            return false;
        };

        if (railsErrorsVM.railsErrors()) {
            railsErrorsVM.mapRailsErrors(railsErrorsVM.railsErrors(), mapErrors, vm.e);
        }
        vm.fillFields(args.project);

        return {
            onSubmit: onSubmit,
            showSuccess: showSuccess,
            showError: showError,
            vm: vm,
            loading: loading
        };
    },
    view: function view(ctrl, args) {
        var vm = ctrl.vm;
        return m('#budget-tab', [ctrl.showSuccess() ? m.component(popNotification, {
            message: I18n$1.t('shared.successful_update'),
            toggleOpt: ctrl.showSuccess
        }) : '', ctrl.showError() ? m.component(popNotification, {
            message: I18n$1.t('shared.failed_update'),
            toggleOpt: ctrl.showError,
            error: true
        }) : '', m('form.w-form', { onsubmit: ctrl.onSubmit }, [m('.w-container', [m('.w-row', [m('.w-col.w-col-10.w-col-push-1', [
        // m('.u-marginbottom-60.u-text-center', [
        //        m('.w-inline-block.card.fontsize-small.u-radius', [
        //     m.trust(I18n.t('budget_alert', I18nScope()))
        //        ])
        //  ]),
        m(bigInputCard, {
            cardStyle: { display: 'block' },
            label: I18n$1.t('budget_label', I18nScope$36()),
            children: [m('.preview-container', {
                class: vm.e.hasError('budget') ? 'error' : false
            }, h.redactor('project[budget]', vm.fields.budget)), vm.e.inlineError('budget')]
        })])])]), m(projectEditSaveBtn, { loading: ctrl.loading, onSubmit: ctrl.onSubmit })])]);
    }
};

var projectEditBudget = {
    controller: function controller(args) {
        return {
            user: userVM.fetchUser(args.user_id),
            project: projectVM.fetchProject(args.project_id)
        };
    },
    view: function view(ctrl, args) {
        return ctrl.user() && ctrl.project() ? m(projectBudgetEdit$1, {
            user: ctrl.user(),
            userId: args.user_id,
            projectId: args.project_id,
            project: ctrl.project()
        }) : m('div', h.loader());
    }
};

var projectEditUserAbout = {
    controller: function controller(args) {
        return {
            user: userVM.fetchUser(args.user_id)
        };
    },
    view: function view(ctrl, args) {
        return ctrl.user() ? m(userAboutEdit, {
            user: ctrl.user(),
            userId: args.user_id,
            useFloatBtn: true,
            hideDisableAcc: true,
            hideCoverImg: true,
            hidePasswordChange: true,
            publishingUserAbout: true
        }) : m('div', h.loader());
    }
};

var projectEditUserSettings = {
    controller: function controller(args) {
        return {
            user: userVM.fetchUser(args.user_id)
        };
    },
    view: function view(ctrl, args) {
        return ctrl.user() ? m(userSettings, {
            user: ctrl.user(),
            userId: args.user_id,
            hideCreditCards: true,
            useFloatBtn: true,
            publishingUserSettings: true
        }) : m('div', h.loader());
    }
};

var editRewardCard = {
    controller: function controller(args) {
        var reward = args.reward(),
            fields = {
            title: m.prop(reward.title),
            shipping_options: m.prop(reward.shipping_options),
            minimumValue: m.prop(reward.minimum_value),
            description: m.prop(reward.description),
            deliverAt: m.prop(reward.deliver_at)
        },
            destroyed = m.prop(false),
            acceptNumeric = function acceptNumeric(e) {
            fields.minimumValue(e.target.value.replace(/[^0-9]/g, ''));
            return true;
        },
            confirmDelete = function confirmDelete() {
            var r = confirm('Are you sure?');
            if (r) {
                return m.request({
                    method: 'DELETE',
                    url: '/projects/' + args.project_id + '/rewards/' + reward.id,
                    config: h.setCsrfToken
                }).then(function () {
                    destroyed(true);
                    m.redraw();
                });
            }
            return false;
        },
            descriptionError = m.prop(false),
            minimumValueError = m.prop(false),
            deliverAtError = m.prop(false),
            index = args.index,
            showTips = h.toggleProp(false, true),
            states = m.prop([]),
            fees = m.prop([]),
            statesLoader = rewardVM.statesLoader,
            updateOptions = function updateOptions() {
            if ((fields.shipping_options() === 'national' || fields.shipping_options() === 'international') && !_$1.contains(_$1.pluck(fees(), 'destination'), 'others')) {
                fees().push({
                    value: 0,
                    destination: 'others'
                });
            }
            if (fields.shipping_options() === 'national') {
                fees(_$1.reject(fees(), function (fee) {
                    return fee.destination === 'international';
                }));
            } else if (fields.shipping_options() === 'international' && !_$1.contains(_$1.pluck(fees(), 'destination'), 'international')) {
                fees().push({
                    value: 0,
                    destination: 'international'
                });
            }
        };

        statesLoader.load().then(function (data) {
            states(data);
            states().unshift({
                acronym: null,
                name: 'state'
            });

            if (!reward.newReward) {
                rewardVM.getFees(reward).then(function (feeData) {
                    fees(feeData);
                    updateOptions();
                });
            }
        });

        _$1.extend(args.reward(), {
            validate: function validate() {
                descriptionError(false);
                minimumValueError(false);
                deliverAtError(false);
                if (reward.newReward && moment(fields.deliverAt()).isBefore(moment().date(-1))) {
                    args.error(true);
                    deliverAtError(true);
                }
                if (_$1.isEmpty(fields.description())) {
                    args.error(true);
                    descriptionError(true);
                }
                if (!fields.minimumValue() || parseInt(fields.minimumValue()) < 10) {
                    args.error(true);
                    minimumValueError(true);
                }
                _$1.map(fees(), function (fee) {
                    _$1.extend(fee, { error: false });
                    if (fee.destination === null) {
                        args.error(true);
                        _$1.extend(fee, { error: true });
                    }
                });
            }
        });

        return {
            fields: fields,
            minimumValueError: minimumValueError,
            deliverAtError: deliverAtError,
            descriptionError: descriptionError,
            confirmDelete: confirmDelete,
            acceptNumeric: acceptNumeric,
            updateOptions: updateOptions,
            showTips: showTips,
            destroyed: destroyed,
            states: states,
            reward: reward,
            index: index,
            fees: fees
        };
    },
    view: function view(ctrl, args) {
        var index = ctrl.index,
            newFee = {
            value: null,
            destination: null
        },
            fees = ctrl.fees(),
            reward = args.reward(),
            inlineError = function inlineError(message) {
            return m('.fontsize-smaller.text-error.u-marginbottom-20.fa.fa-exclamation-triangle', m('span', message));
        };

        return ctrl.destroyed() ? m('div', '') : m('.w-row.card.card-terciary.u-marginbottom-20.card-edition.medium', [m('.card', m('.w-form', [m('.w-row', [m('.w-col.w-col-5', m('label.fontsize-smaller', 'Title:')), m('.w-col.w-col-7', m('input.w-input.text-field.positive[aria-required=\'true\'][autocomplete=\'off\'][type=\'tel\'][id=\'project_rewards_attributes_' + index + '_title\']', {
            name: 'project[rewards_attributes][' + index + '][title]',
            value: ctrl.fields.title(),
            onchange: m.withAttr('value', ctrl.fields.title)
        }))]), m('.w-row.u-marginbottom-20', [m('.w-col.w-col-5', m('label.fontsize-smaller', 'Minimum value:')), m('.w-col.w-col-7', [m('.w-row', [m('.w-col.w-col-3.w-col-small-3.w-col-tiny-3.text-field.positive.prefix.no-hover', m('.fontsize-smallest.fontcolor-secondary.u-text-center', 'Rs')), m('.w-col.w-col-9.w-col-small-9.w-col-tiny-9', m('input.string.tel.required.w-input.text-field.project-edit-reward.positive.postfix[aria-required=\'true\'][autocomplete=\'off\'][required=\'required\'][type=\'tel\'][id=\'project_rewards_attributes_' + index + '_minimum_value\']', {
            name: 'project[rewards_attributes][' + index + '][minimum_value]',

            class: ctrl.minimumValueError() ? 'error' : false,
            value: ctrl.fields.minimumValue(),
            oninput: function oninput(e) {
                return ctrl.acceptNumeric(e);
            }
        }))]), ctrl.minimumValueError() ? inlineError('Amount must be equal to or greater than Rs 10.') : '', m(".fontsize-smaller.text-error.u-marginbottom-20.fa.fa-exclamation-triangle.w-hidden[data-error-for='reward_minimum_value']", 'Enter a minimum value greater than or equal to 10')])]), m('.w-row', [m('.w-col.w-col-5', m('label.fontsize-smaller', 'Delivery forecast:')), m('.w-col.w-col-7', m('.w-row', m('.w-col.w-col-12', m('.w-row', [m('input[id=\'project_rewards_attributes_' + index + '_deliver_at_3i\'][type=\'hidden\'][value=\'1\']', {
            name: 'project[rewards_attributes][' + index + '][deliver_at(3i)]'
        }), m('select.date.required.w-input.text-field.w-col-6.positive[aria-required=\'true\'][discard_day=\'true\'][required=\'required\'][use_short_month=\'true\'][id=\'project_rewards_attributes_' + index + '_deliver_at_2i\']', {
            name: 'project[rewards_attributes][' + index + '][deliver_at(2i)]',
            class: ctrl.deliverAtError() ? 'error' : false,
            onchange: function onchange(e) {
                ctrl.fields.deliverAt(moment(ctrl.fields.deliverAt()).month(parseInt(e.target.value) - 1).format());
            }
        }, [_$1.map(moment.monthsShort(), function (month, monthIndex) {
            return m('option[value=\'' + (monthIndex + 1) + '\']', {
                selected: moment(ctrl.fields.deliverAt()).format('M') == monthIndex + 1
            }, h.capitalize(month));
        })]), m('select.date.required.w-input.text-field.w-col-6.positive[aria-required=\'true\'][discard_day=\'true\'][required=\'required\'][use_short_month=\'true\'][id=\'project_rewards_attributes_' + index + '_deliver_at_1i\']', {
            name: 'project[rewards_attributes][' + index + '][deliver_at(1i)]',
            class: ctrl.deliverAtError() ? 'error' : false,
            onchange: function onchange(e) {
                ctrl.fields.deliverAt(moment(reward.deliverAt).year(parseInt(e.target.value)).format());
            }
        }, [_$1.map(_$1.range(moment().year(), moment().year() + 6), function (year) {
            return m('option[value=\'' + year + '\']', {
                selected: moment(ctrl.fields.deliverAt()).format('YYYY') === String(year)
            }, year);
        })])]))), ctrl.deliverAtError() ? inlineError('Delivery date can not be in the past.') : '')]), m('.w-row', m('label.fontsize-smaller', 'Description:')), m('.w-row', [m('textarea.text.required.w-input.text-field.positive.height-medium[aria-required=\'true\'][placeholder=\'Describe your reward\'][required=\'required\'][id=\'project_rewards_attributes_' + index + '_description\']', {
            name: 'project[rewards_attributes][' + index + '][description]',
            value: ctrl.fields.description(),
            class: ctrl.descriptionError() ? 'error' : false,
            onchange: m.withAttr('value', ctrl.fields.description)
        }), m(".fontsize-smaller.text-error.u-marginbottom-20.fa.fa-exclamation-triangle.w-hidden[data-error-for='reward_description']", 'Description can not be empty')]), ctrl.descriptionError() ? inlineError('Description can not be empty.') : '',,
        // m('.u-marginbottom-30.w-row', [
        //     m('.w-col.w-col-3',
        //         m("label.fontsize-smaller[for='field-2']",
        //             'Tipo de entrega'
        //         )
        //     ),
        //     m('.w-col.w-col-9', [
        //         m(`select.positive.text-field.w-select[id='project_rewards_attributes_${index}_shipping_options']`, {
        //             name: `project[rewards_attributes][${index}][shipping_options]`,
        //             value: ctrl.fields.shipping_options() || 'free',
        //             onchange: (e) => {
        //                 ctrl.fields.shipping_options(e.target.value);
        //                 ctrl.updateOptions();
        //             }
        //         }, [
        //             m('option[value=\'international\']',
        //                 'Frete Nacional e Internacional'
        //             ),
        //             m('option[value=\'national\']',
        //                 'Frete Nacional'
        //             ),
        //             m('option[value=\'free\']',
        //                 'Sem frete envolvido'
        //             ),
        //             m('option[value=\'presential\']',
        //                 'Retirada presencial'
        //             )
        //         ]),
        //
        //         ((ctrl.fields.shipping_options() === 'national' || ctrl.fields.shipping_options() === 'international') ?
        //             m('.card.card-terciary', [
        //
        //                 // state fees
        //                 (_.map(fees, (fee, feeIndex) => [m(shippingFeeInput, {
        //                     fee,
        //                     fees: ctrl.fees,
        //                     index,
        //                     feeIndex,
        //                     states: ctrl.states
        //                 }),
        //
        //                 ])),
        //                 m('.u-margintop-20',
        //                     m("a.alt-link[href='#']", {
        //                         onclick: () => {
        //                             ctrl.fees().push(newFee);
        //                             return false;
        //                         }
        //
        //                     },
        //                         'Adicionar destino'
        //                     )
        //                 )
        //             ]) : '')
        //     ])
        // ]),
        m('.Limit must be greater than amount of supportsw-row.u-margintop-30', [reward.newReward ? '' : m('.w-col.w-col-5.w-col-small-5.w-col-tiny-5.w-sub-col-middle', m("input.w-button.btn-terciary.btn.btn-small.reward-close-button[type='submit'][value='Close']", {
            onclick: function onclick() {
                reward.edit.toggle();
            }
        })), m('.w-col.w-col-1.w-col-small-1.w-col-tiny-1', [m('input[id=\'project_rewards_attributes_' + index + '__destroy\'][type=\'hidden\'][value=\'false\']', {
            name: 'project[rewards_attributes][' + index + '][_destroy]'
        }), m('a.remove_fields.existing', { onclick: ctrl.confirmDelete }, m('.btn.btn-small.btn-terciary.fa.fa-lg.fa-trash.btn-no-border'))])])]))]);
    }
};

var I18nScope$38 = _$1.partial(h.i18nScope, 'projects.reward_fields');

var dashboardRewardCard = {
    controller: function controller(args) {
        var reward = args.reward(),
            availableCount = function availableCount() {
            return reward.maximum_contributions - reward.paid_count;
        },
            maximumContributions = m.prop(args.reward().maximum_contributions),
            limitError = m.prop(false),
            toggleLimit = function toggleLimit() {
            reward.limited.toggle();
            maximumContributions('');
            m.redraw();
        };

        _$1.extend(args.reward(), {
            validate: function validate() {
                limitError(false);
                if (maximumContributions() && reward.paid_count > maximumContributions()) {
                    limitError(true);
                    args.error(true);
                }
            }
        });

        return {
            availableCount: availableCount,
            toggleLimit: toggleLimit,
            limitError: limitError,
            maximumContributions: maximumContributions
        };
    },
    view: function view(ctrl, args) {
        var reward = args.reward(),
            index = args.index;
        return m('.w-row.cursor-move.card-persisted.card.card-terciary.u-marginbottom-20.medium.sortable', [m('.card', [m('.w-row', [m('.w-col.w-col-11.w-col-small-11.w-col-tiny-11', m('.fontsize-base.fontweight-semibold', I18n$1.t('minimum_value_title', I18nScope$38({
            minimum_value: reward.minimum_value
        })))), rewardVM.canEdit(reward, args.project_state, args.user) ? m('.w-col.w-col-1.w-col-small-1.w-col-tiny-1', m("a.show_reward_form[href='javascript:void(0);']", {
            onclick: function onclick() {
                reward.edit.toggle();
            }
        }, m('.btn.btn-small.btn-terciary.fa.fa-lg.fa-edit.btn-no-border'))) : '']), m('.fontsize-smaller.u-marginbottom-20.fontweight-semibold', I18n$1.t('paid_contributors', I18nScope$38({
            count: reward.paid_count
        }))), m('.fontsize-small.fontweight-semibold', reward.title), m('.fontsize-small.fontcolor-secondary', m.trust(h.simpleFormat(h.strip(reward.description)))), reward.limited() ? ctrl.availableCount() <= 0 ? m('.u-margintop-10', m('span.badge.badge-gone.fontsize-smaller', I18n$1.t('reward_gone', I18nScope$38()))) : m('.u-margintop-10', m('span.badge.badge-attention.fontsize-smaller', [m('span.fontweight-bold', I18n$1.t('reward_limited', I18nScope$38())), I18n$1.t('reward_available', I18nScope$38({
            available: ctrl.availableCount(),
            maximum: reward.maximum_contributions
        }))])) : '', reward.deliver_at ? m('.fontsize-smallest', [m('b', I18n$1.t('delivery_estimation', I18nScope$38())), h.momentify(reward.deliver_at, 'MMM/YYYY')]) : '',
        // m('.fontsize-smallest', m('b', `${I18n.t('delivery', I18nScope())}: `), I18n.t(`shipping_options.${reward.shipping_options}`, I18nScope())),
        m('.u-margintop-40.w-row', [m('.w-col.w-col-6', [m('.w-checkbox', [m("input.w-checkbox-input[type='checkbox']", { onclick: ctrl.toggleLimit, checked: reward.limited() }), m('label.fontsize-smaller.fontweight-semibold.w-form-label', I18n$1.t('reward_limited_input', I18nScope$38()))]), m('div' + (reward.limited() ? '' : '.w-hidden'), m('input.string.tel.optional.w-input.text-field.u-marginbottom-30.positive[placeholder=\'Available Quantity\'][type=\'tel\'][id=\'project_rewards_attributes_' + index + '_maximum_contributions\']', {
            name: 'project[rewards_attributes][' + index + '][maximum_contributions]',
            class: ctrl.limitError() ? 'error' : false,
            value: ctrl.maximumContributions(),
            onchange: m.withAttr('value', ctrl.maximumContributions)
        }))]), m('.w-col.w-col-6')]), ctrl.limitError() ? m(inlineError, { message: 'Limit must be greater than amount of supports.' }) : '',,])
        // m('.u-margintop-20', [
        //     m('.fontcolor-secondary.fontsize-smallest.fontweight-semibold',
        //         I18n.t('reward_link_label', I18nScope())
        //     ),
        //     m('.fontcolor-secondary.fontsize-smallest.u-marginbottom-10',
        //         I18n.t('reward_link_hint', I18nScope())
        //     ),
        //     m('.w-form',
        //         m('.w-col.w-col-6',
        //             m.component(copyTextInput, {
        //                 value: `http://www.grasruts.com/projects/${args.project_id}/contributions/new?reward_id=${reward.id}`
        //             }),
        //         )
        //     ),
        // ]),
        ]);
    }
};

var I18nScope$37 = _$1.partial(h.i18nScope, 'projects.reward_fields');

var projectEditReward = {
    controller: function controller(args) {
        var rewards = m.prop([]),
            loading = m.prop(false),
            error = m.prop(false),
            errors = m.prop([]),
            showSuccess = m.prop(false),
            availableCount = function availableCount(reward) {
            return reward.maximum_contributions - reward.paid_count;
        },
            updateRewardData = function updateRewardData() {
            var data = $('#reward_form').serialize();
            loading(true);
            // m.request won't serialize params properly here
            return $.ajax({
                type: 'PATCH',
                url: '/en/projects/' + args.project_id + '\'',
                data: data,
                dataType: 'JSON'
            }).done(function () {
                error(false);
                showSuccess(true);
                loadRewards();
                m.redraw();
            }).fail(function (json) {
                error(true);
                showSuccess(false);
                var messages = JSON.parse(json.responseText).errors.join('</br>');
                errors(messages);
            }).always(function () {
                loading(false);
                m.redraw();
            });
        },
            onSubmit = function onSubmit() {
            error(false);
            errors('Error saving information. Check the data reported.');
            _$1.map(rewards(), function (reward) {
                if (reward().validate) {
                    reward().validate();
                }
            });
            if (!error()) {
                updateRewardData();
            }

            return false;
        },
            newReward = function newReward() {
            return {
                id: null,
                minimum_value: null,
                title: null,
                deliver_at: moment().date(1).format(),
                description: null,
                paid_count: 0,
                edit: m.prop(true),
                limited: h.toggleProp(false, true),
                maximum_contributions: null,
                newReward: true,
                row_order: 999999999 + rewards().length * 20 // we need large and spaced apart numbers
            };
        };

        var updateRewardSortPosition = function updateRewardSortPosition(rewardId, position) {
            return m.request({
                method: 'POST',
                url: '/en/projects/' + args.project_id + '/rewards/' + rewardId + '/sort?reward[row_order_position]=' + position,
                config: function config(xhr) {
                    if (h.authenticityToken()) {
                        xhr.setRequestHeader('X-CSRF-Token', h.authenticityToken());
                        xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
                    }
                }
            });
        };

        var setSorting = function setSorting(el, isInit) {
            if (!isInit && window.$) {
                window.$(el).sortable({
                    update: function update(event, ui) {
                        var rewardId = ui.item[0].id;
                        updateRewardSortPosition(rewardId, ui.item.index());
                    }
                });
            }
        };

        var loadRewards = function loadRewards() {
            return rewardVM.fetchRewards(args.project_id).then(function () {
                rewards([]);
                _$1.map(rewardVM.rewards(), function (reward) {
                    var limited = reward.maximum_contributions !== null;
                    _$1.extend(reward, {
                        edit: h.toggleProp(false, true),
                        limited: h.toggleProp(limited, !limited)
                    });
                    rewards().push(m.prop(reward));
                });

                if (rewardVM.rewards().length === 0) {
                    rewards().push(m.prop(newReward()));
                }
            });
        };

        var tips = I18n$1.translations[I18n$1.currentLocale()].projects.reward_fields.faq;

        loadRewards();

        return {
            loading: loading,
            error: error,
            errors: errors,
            showSuccess: showSuccess,
            rewards: rewards,
            onSubmit: onSubmit,
            user: userVM.fetchUser(args.user_id),
            availableCount: availableCount,
            newReward: newReward,
            setSorting: setSorting,
            tips: tips
        };
    },
    view: function view(ctrl, args) {
        var error = ctrl.error,
            project = args.project;

        return m("[id='dashboard-rewards-tab']", project() ? [m('.w-section.section', m('.w-container', [ctrl.showSuccess() ? m.component(popNotification, {
            message: 'Rewards successfully saved'
        }) : '', ctrl.error() ? m.component(popNotification, {
            message: ctrl.errors(),
            error: true
        }) : '',
        // m('.w-row',
        //     m('.w-col.w-col-8.w-col-push-2',
        //         m('.u-marginbottom-60.u-text-center',
        //             m('.w-inline-block.card.fontsize-small.u-radius',
        //                 [
        //                     m('span.fa.fa-lightbulb-o'),
        //                     m.trust(` ${I18n.t('reward_know_more_cta_html', I18nScope())}`)
        //                 ]
        //             )
        //         )
        //     )
        // ),
        m('.w-row', [m('.w-col.w-col-9', m('form.simple_form.project-form.w-form[id=\'reward_form\']', {
            onsubmit: ctrl.onSubmit
        }, [m("input[name='utf8'][type='hidden'][value='✓']"), m("input[name='_method'][type='hidden'][value='patch']"), m('input[name="authenticity_token"][type="hidden"][value=' + h.authenticityToken() + ']'), m('input[id=\'project_id\'][name=\'project_id\'][type=\'hidden\'][value=\'' + args.project_id + '\']'), m("input[id='anchor'][name='anchor'][type='hidden'][value='reward']"), m("[id='dashboard-rewards']", [ctrl.rewards().length === 0 ? '' : m(".ui-sortable[id='rewards']", {
            config: ctrl.setSorting
        }, [_$1.map(_$1.sortBy(ctrl.rewards(), function (reward) {
            return Number(reward().row_order);
        }), function (reward, index) {
            return m('div[id=' + reward().id + ']', [m('.nested-fields', m('.reward-card', [!reward().edit() ? m(dashboardRewardCard, {
                index: index,
                reward: reward,
                error: error,
                user: ctrl.user(),
                project_id: args.project_id,
                project_state: project().state
            }) : m(editRewardCard, {
                project_id: args.project_id,
                error: error,
                reward: reward,
                index: index
            })])), m('input.ui-sortable-handle[id=\'project_rewards_attributes_' + index + '_id\'][type=\'hidden\']', {
                name: 'project[rewards_attributes][' + index + '][id]',
                value: reward().id
            })]);
        })])])]), rewardVM.canAdd(project().state, ctrl.user()) ? [m('button.btn.btn-large.btn-message.show_reward_form.new_reward_button.add_fields', {
            onclick: function onclick() {
                return ctrl.rewards().push(m.prop(ctrl.newReward()));
            }
        }, I18n$1.t('add_reward', I18nScope$37()))] : ''), m('.w-col.w-col-3', [I18n$1.t('reward_faq_intro', I18nScope$37()), m('br'), m('br'), I18n$1.t('reward_faq_sub_intro', I18nScope$37()), m('br'), m('br'), _$1.map(ctrl.tips, function (tip) {
            return [m('.fontweight-semibold', tip.title), m.trust(tip.description), m('br'), m('br')];
        })])])]), rewardVM.canAdd(project().state, ctrl.user()) ? [m(projectEditSaveBtn, {
            loading: ctrl.loading,
            onSubmit: ctrl.onSubmit
        })] : '')] : h.loader());
    }
};

var e$8 = generateErrorInstance();
var currentProject$2 = m.prop({});

var fields$7 = {
    headline: m.prop(''),
    uploaded_image: m.prop(''),
    upload_files: m.prop(undefined)
};

var fillFields$5 = function fillFields(data) {
    fields$7.headline(data.headline || '');
    currentProject$2(data);
};

var reloadCurrentProject = function reloadCurrentProject() {
    if (currentProject$2().id) {
        projectVM.fetchProject(currentProject$2().id, false).then(function (data) {
            currentProject$2(_.first(data));
            m.redraw();
        });
    }
};

var prepareForUpload = function prepareForUpload(event) {
    var formData = new FormData();
    if (event.target.files[0]) {
        formData.append('uploaded_image', event.target.files[0]);
    }
    fields$7.upload_files(formData);
};

var uploadImage = function uploadImage(project_id) {
    if (_.isUndefined(fields$7.upload_files())) {
        var deferred = m.deferred();
        deferred.resolve({});
        return deferred.promise;
    }
    return m.request({
        method: 'POST',
        url: '/projects/' + project_id + '/upload_image.json',
        data: fields$7.upload_files(),
        config: h.setCsrfToken,
        serialize: function serialize(data) {
            return data;
        }
    });
};

var updateProject$6 = function updateProject(project_id) {
    var projectData = {
        headline: fields$7.headline()
    };

    return projectVM.updateProject(project_id, projectData);
};

var projectCardVM = {
    fields: fields$7,
    fillFields: fillFields$5,
    updateProject: updateProject$6,
    e: e$8,
    prepareForUpload: prepareForUpload,
    uploadImage: uploadImage,
    currentProject: currentProject$2,
    reloadCurrentProject: reloadCurrentProject
};

var I18nScope$39 = _$1.partial(h.i18nScope, 'projects.dashboard_card');

var projectCardEdit = {
    controller: function controller(args) {
        var vm = projectCardVM,
            mapErrors = [['uploaded_image', ['uploaded_image']], ['headline', ['headline']]],
            showSuccess = h.toggleProp(false, true),
            showError = h.toggleProp(false, true),
            loading = m.prop(false),
            onSubmit = function onSubmit(event) {
            loading(true);
            m.redraw();
            vm.uploadImage(args.projectId).then(function (uploaded) {
                vm.updateProject(args.projectId).then(function (data) {
                    loading(false);
                    vm.e.resetFieldErrors();
                    if (!showSuccess()) {
                        showSuccess.toggle();
                    }
                    if (showError()) {
                        showError.toggle();
                    }
                    vm.reloadCurrentProject();
                    railsErrorsVM.validatePublish();
                }).catch(function (err) {
                    if (err.errors_json) {
                        railsErrorsVM.mapRailsErrors(err.errors_json, mapErrors, vm.e);
                    }
                    loading(false);
                    if (showSuccess()) {
                        showSuccess.toggle();
                    }
                    if (!showError()) {
                        showError.toggle();
                    }
                    m.redraw();
                });
            }).catch(function (uploaderr) {
                if (uploaderr.errors_json) {
                    railsErrorsVM.mapRailsErrors(uploaderr.errors_json, mapErrors, vm.e);
                }
                loading(false);
                if (showSuccess()) {
                    showSuccess.toggle();
                }
                if (!showError()) {
                    showError.toggle();
                }
            });
            return false;
        };

        if (railsErrorsVM.railsErrors()) {
            railsErrorsVM.mapRailsErrors(railsErrorsVM.railsErrors(), mapErrors, vm.e);
        }
        vm.fillFields(args.project);

        return {
            onSubmit: onSubmit,
            showSuccess: showSuccess,
            showError: showError,
            vm: vm,
            loading: loading
        };
    },
    view: function view(ctrl, args) {
        var vm = ctrl.vm;
        return m('#card-tab', [ctrl.showSuccess() ? m.component(popNotification, {
            message: I18n$1.t('shared.successful_update'),
            toggleOpt: ctrl.showSuccess
        }) : '', ctrl.showError() ? m.component(popNotification, {
            message: I18n$1.t('shared.failed_update'),
            toggleOpt: ctrl.showError,
            error: true
        }) : '', m('form.w-form', { onsubmit: ctrl.onSubmit }, [m('.w-section.section', [m('.w-container', [m('.w-row', [m('.w-col.w-col-8', [m(inputCard, {
            label: I18n$1.t('uploaded_image_label', I18nScope$39()),
            label_hint: I18n$1.t('uploaded_image_hint', I18nScope$39()),
            children: [m('input.file.optional.w-input.text-field[id="project_uploaded_image"][name="project[uploaded_image]"][type="file"]', {
                class: vm.e.hasError('uploaded_image') ? 'error' : false,
                onchange: vm.prepareForUpload
            }), vm.e.inlineError('uploaded_image')]
        }), m(inputCard, {
            label: I18n$1.t('headline_label', I18nScope$39()),
            label_hint: I18n$1.t('headline_label_hint', I18nScope$39()),
            children: [m('textarea.text.optional.w-input.text-field.positive[id="project_headline"][maxlength="100"][name="project[headline]"][rows="3"]', {
                onchange: m.withAttr('value', vm.fields.headline),
                class: vm.e.hasError('headline') ? 'error' : false
            }, vm.fields.headline()), vm.e.inlineError('headline')]
        })]), m(projectCard, { project: vm.currentProject(), type: 'small' })])])]), m(projectEditSaveBtn, { loading: ctrl.loading, onSubmit: ctrl.onSubmit })])]);
    }
};

var projectEditCard = {
    controller: function controller(args) {
        return {
            user: userVM.fetchUser(args.user_id),
            project: projectVM.fetchProject(args.project_id)
        };
    },
    view: function view(ctrl, args) {
        return ctrl.user() && ctrl.project() ? m(projectCardEdit, {
            user: ctrl.user(),
            userId: args.user_id,
            projectId: args.project_id,
            project: ctrl.project()
        }) : m('div', h.loader());
    }
};

var projectPreview = {
    view: function view(ctrl, args) {
        return args.project() ? m('div', [m('.u-text-center', m('.w-container', m('.w-row', [m('.w-col.w-col-8.w-col-push-2', [m('.fontweight-semibold.fontsize-large.u-margintop-40', 'It`s time for feedbacks!'), m('p.fontsize-base', 'Share the link below with your friends and take the time to make fine adjustments to help with your campaign.'), m('.w-row.u-marginbottom-30', [m('.w-col.w-col-3'), m('.w-col.w-col-6', m('input.w-input.text-field[type=\'text\'][value=\'http://www.grasruts.com/' + args.project().permalink + '\']')), m('.w-col.w-col-3')])]), m('.w-col.w-col-2')]))), m(projectsShow, args)]) : h.loader();
    }
};

var announceExpirationModal = {
    view: function view(ctrl, args) {
        return m('div', [m('.modal-dialog-content', [m('.fontsize-large.u-text-center.u-marginbottom-30.fontweight-semibold', 'Do you confirm?'), m('.fontsize-large.u-text-center.u-marginbottom-30', ['Your collection will end on  ', m('span.expire-date', args.expirationDate), ', at 23h59. Until then, you can capture resources and stay strong in your campaign! Once your deadline has expired, you will need to confirm your bank details. We will then deposit the money into your account within 10 business days.'])]), m('.modal-dialog-nav-bottom', m('.w-row', [m('.w-col.w-col-2'), m('.w-col.w-col-4', [m("input[id='anchor'][name='anchor'][type='hidden'][value='announce_expiration']"), m("input.btn.btn.btn-large[id='budget-save'][name='commit'][type='submit'][value='Yes']")]), m('.w-col.w-col-4', m('button.btn.btn-large.btn-terciary', {
            onclick: args.displayModal.toggle
        }, ' No')), m('.w-col.w-col-2')]))]);
    }
};

var projectAnnounceExpiration = {
    controller: function controller() {
        var days = m.prop(2),
            showModal = h.toggleProp(false, true);
        return {
            days: days,
            showModal: showModal
        };
    },
    view: function view(ctrl, args) {
        var days = ctrl.days,
            expirationDate = moment().add(ctrl.days(), 'days').format('DD/MM/YYYY');
        return m("[id='dashboard-announce_expiration-tab']", m('form.simple_form.project-form.w-form[accept-charset=\'UTF-8\'][action=\'/en/flexible_projects/' + args.project_id + '\'][id=\'expiration-form\'][method=\'post\'][novalidate=\'novalidate\']', [m("input[name='utf8'][type='hidden'][value='✓']"), m("input[name='_method'][type='hidden'][value='patch']"), m('input[name=\'authenticity_token\'][type=\'hidden\'][value=\'' + h.authenticityToken() + '\']'), m('.w-section', m('.w-container', m('.w-row.u-marginbottom-60', [m('.w-col.w-col-1'), m('.w-col.w-col-10', m('.card-big.card.card-terciary.u-radius', [m('.u-marginbottom-30.w-row', [m('.w-sub-col.w-col.w-col-6', m('.fontsize-small.u-marginbottom-10', ['On how many days, from now on, do you want to close your collection?', m('br'), m('span.fontsize-smaller.fontweight-semibold', '(2 days minimum)')])), m('.w-col.w-col-6', m('.w-row', [m('.w-col.w-col-8.w-col-small-6.w-col-tiny-6', m("input.numeric.numeric.optional.w-input.text-field.positive.medium[id='flexible_project_online_days'][step='any'][type='number']", {
            name: 'flexible_project[online_days]',
            value: days(),
            onchange: m.withAttr('value', ctrl.days)
        })), m('.medium.no-hover.postfix.prefix-permalink.text-field.w-col.w-col-4.w-col-small-6.w-col-tiny-6', m('.fontcolor-secondary.fontsize-base.lineheight-tightest.u-text-center', 'Days'))]))]), m('.fontcolor-secondary.u-text-center', [m('.fontsize-smaller', 'You can receive support until:'), m('.fontsize-base', [m('span.expire-date', expirationDate), ' at 23h59m'])])])), m('.w-col.w-col-1')]))), m('.w-section', m('.w-container', m('.w-row', [m('.w-col.w-col-4'), m('.w-col.w-col-4', m('button.btn.btn-large.u-marginbottom-20', {
            onclick: function onclick(e) {
                ctrl.showModal.toggle();
                e.preventDefault();
            }
        }, '  Confirm'))]))), ctrl.showModal() ? m.component(modalBox, {
            displayModal: ctrl.showModal,
            content: [announceExpirationModal, {
                expirationDate: expirationDate,
                displayModal: ctrl.showModal
            }]
        }) : '']));
    }
};

var projectEditTab = {
  view: function view(ctrl, args) {
    return m('div.u-marginbottom-80', [m(".w-section.dashboard-header.u-text-center[id='dashboard-titles-root']", m('.w-container', m('.w-row', m('.w-col.w-col-8.w-col-push-2.u-marginbottom-30', [m(".fontweight-semibold.fontsize-larger.lineheight-looser[id='dashboard-page-title']", m.trust(args.title)), m(".fontsize-base[id='dashboard-page-subtitle']", m.trust(args.subtitle))])))), m('.u-marginbottom-80', args.content)]);
  }
};

// @TODO move all tabs to c/
// using the inside components that root tabs use
var I18nScope$31 = _$1.partial(h.i18nScope, 'projects.edit');

var projectEdit = {
    controller: function controller(args) {
        var project_id = args.project_id,
            user_id = args.user_id;


        var project = projectVM.fetchProject(project_id),
            hash = m.prop(window.location.hash),
            displayTabContent = function displayTabContent() {
            var c_opts = {
                project_id: project_id,
                user_id: user_id,
                project: project
            },
                tabs = {
                '#video': m(projectEditTab, {
                    title: I18n$1.t('video_html', I18nScope$31()),
                    subtitle: I18n$1.t('video_subtitle', I18nScope$31()),
                    content: m(projectEditVideo, _$1.extend({}, c_opts))
                }),
                '#description': m(projectEditTab, {
                    title: I18n$1.t('description', I18nScope$31()),
                    subtitle: I18n$1.t('description_subtitle', I18nScope$31()),
                    content: m(projectEditDescription, _$1.extend({}, c_opts))
                }),
                '#budget': m(projectEditTab, {
                    title: I18n$1.t('budget', I18nScope$31()),
                    subtitle: I18n$1.t('budget_subtitle', I18nScope$31()),
                    content: m(projectEditBudget, _$1.extend({}, c_opts))
                }),
                '#reward': m(projectEditTab, {
                    title: I18n$1.t('reward_html', I18nScope$31()),
                    subtitle: I18n$1.t('reward_subtitle', I18nScope$31()),
                    content: m(projectEditReward, _$1.extend({}, c_opts))
                }),
                '#user_settings': m(projectEditTab, {
                    title: I18n$1.t('user_settings', I18nScope$31()),
                    // subtitle: I18n.t('user_settings_subtitle', I18nScope()),
                    subtitle: '',
                    content: m(projectEditUserSettings, _$1.extend({}, c_opts))
                }),
                '#user_about': m(projectEditTab, {
                    title: I18n$1.t('user_about', I18nScope$31()),
                    subtitle: I18n$1.t('user_about_subtitle', I18nScope$31()),
                    content: m(projectEditUserAbout, _$1.extend({}, c_opts))
                }),
                '#card': m(projectEditTab, {
                    title: I18n$1.t('card', I18nScope$31()),
                    subtitle: I18n$1.t('card_subtitle', I18nScope$31()),
                    content: m(projectEditCard, _$1.extend({}, c_opts))
                }),
                '#basics': m(projectEditTab, {
                    title: I18n$1.t('basics', I18nScope$31()),
                    subtitle: I18n$1.t('basics_subtitle', I18nScope$31()),
                    content: m(projectEditBasic, _$1.extend({}, c_opts))
                }),
                '#goal': m(projectEditTab, {
                    title: I18n$1.t('goal', I18nScope$31()),
                    subtitle: I18n$1.t('goal_subtitle', I18nScope$31()),
                    content: m(projectEditGoal, _$1.extend({}, c_opts))
                }),
                '#announce_expiration': m(projectEditTab, {
                    title: I18n$1.t('announce_expiration', I18nScope$31()),
                    subtitle: I18n$1.t('announce_expiration_subtitle', I18nScope$31()),
                    content: m(projectAnnounceExpiration, _$1.extend({}, c_opts))
                }),
                '#preview': m(projectPreview, _$1.extend({}, c_opts))
            };

            hash(window.location.hash);

            if (_$1.isEmpty(hash()) || hash() === '#_=_') {
                return tabs['#basics'];
            }

            return tabs[hash()];
        };

        h.redrawHashChange();
        return {
            displayTabContent: displayTabContent,
            hash: hash,
            project: project
        };
    },
    view: function view(ctrl, args) {
        var project = ctrl.project;

        return m('.project-dashboard-edit', project() ? [m('.w-section.section-product.' + project().mode), ctrl.displayTabContent(), project() ? m.component(projectDashboardMenu, {
            project: project
        }) : ''] : '');
    }
};

var I18nScope$42 = _.partial(h.i18nScope, 'projects.contributions.edit.errors');

var paymentSlip = {
    controller: function controller(args) {
        var vm = args.vm,
            slipPaymentDate = vm.getSlipPaymentDate(args.contribution_id),
            loading = m.prop(false),
            error = m.prop(false),
            completed = m.prop(false);

        var buildSlip = function buildSlip() {
            loading(true);
            m.redraw();
            vm.paySlip(args.contribution_id, args.project_id, error, loading, completed);

            return false;
        };

        return {
            buildSlip: buildSlip,
            slipPaymentDate: slipPaymentDate,
            loading: loading,
            completed: completed,
            error: error
        };
    },
    view: function view(ctrl, args) {
        return m('.w-row', m('.w-col.w-col-12', m('.u-margintop-30.u-marginbottom-60.u-radius.card-big.card', [m('.fontsize-small.u-marginbottom-20', ctrl.slipPaymentDate() ? 'This bank slip expires on ' + h.momentify(ctrl.slipPaymentDate().slip_expiration_date) + '.' : 'Loading...'), m('.fontsize-small.u-marginbottom-40', 'In generating the ticket, the director is already counting on his support. Pay through the internet due date, lottery houses, ATMs or bank branch.'), m('.w-row', m('.w-col.w-col-8.w-col-push-2', [ctrl.loading() ? h.loader() : ctrl.completed() ? '' : m('input.btn.btn-large.u-marginbottom-20', {
            onclick: ctrl.buildSlip,
            value: 'Print Ticket',
            type: 'submit'
        }), ctrl.error() ? m.component(inlineError, { message: ctrl.error() }) : '', m('.fontsize-smallest.u-text-center.u-marginbottom-30', ['By supporting, you agree with the ', m('a.alt-link[href=\'/en/terms-of-use\']', 'Terms of use '), 'and ', m('a.alt-link[href=\'/en/privacy-policy\']', 'privacy policy')])]))])));
    }
};

var defaultFormat = /(\d{1,4})/g;

var indexOf = [].indexOf || function (item) {
    for (var i = 0, l = this.length; i < l; i++) {
        if (i in this && this[i] === item) return i;
    }return -1;
};

var cards = [{
    type: 'elo',
    patterns: [401178, 401179, 431274, 438935, 451416, 457393, 457631, 457632, 504175, 506699, 5067, 509, 627780, 636297, 636368, 650, 6516, 6550],
    format: defaultFormat,
    length: [16],
    cvvLength: [3],
    luhn: true
}, {
    type: 'maestro',
    patterns: [5018, 502, 503, 506, 56, 58, 639, 6220, 67],
    format: defaultFormat,
    length: [12, 13, 14, 15, 16, 17, 18, 19],
    cvvLength: [3],
    luhn: true
}, {
    type: 'forbrugsforeningen',
    patterns: [600],
    format: defaultFormat,
    length: [16],
    cvvLength: [3],
    luhn: true
}, {
    type: 'dankort',
    patterns: [5019],
    format: defaultFormat,
    length: [16],
    cvvLength: [3],
    luhn: true
}, {
    type: 'visa',
    patterns: [4],
    format: defaultFormat,
    length: [13, 16],
    cvvLength: [3],
    luhn: true
}, {
    type: 'mastercard',
    patterns: [51, 52, 53, 54, 55, 22, 23, 24, 25, 26, 27],
    format: defaultFormat,
    length: [16],
    cvvLength: [3],
    luhn: true
}, {
    type: 'amex',
    patterns: [34, 37],
    format: /(\d{1,4})(\d{1,6})?(\d{1,5})?/,
    length: [15],
    cvvLength: [3, 4],
    luhn: true
}, {
    type: 'dinersclub',
    patterns: [30, 36, 38, 39],
    format: /(\d{1,4})(\d{1,6})?(\d{1,4})?/,
    length: [14],
    cvvLength: [3],
    luhn: true
}, {
    type: 'discover',
    patterns: [60, 64, 65, 622],
    format: defaultFormat,
    length: [16],
    cvvLength: [3],
    luhn: true
}, {
    type: 'unionpay',
    patterns: [62, 88],
    format: defaultFormat,
    length: [16, 17, 18, 19],
    cvvLength: [3],
    luhn: false
}, {
    type: 'jcb',
    patterns: [35],
    format: defaultFormat,
    length: [16],
    cvvLength: [3],
    luhn: true
}];

var inputCardType = function inputCardType(num) {
    var ref = void 0;
    if (!num) {
        return null;
    }
    return ((ref = cardFromNumber(num)) != null ? ref.type : void 0) || null;
};

var cardFromType = function cardFromType(type) {
    var card = void 0,
        i = void 0,
        len = void 0;
    for (i = 0, len = cards.length; i < len; i++) {
        card = cards[i];
        if (card.type === type) {
            return card;
        }
    }
};

var setCardType = function setCardType(e, type) {
    var $target = void 0,
        allTypes = void 0,
        card = void 0,
        cardType = void 0,
        val = void 0;
    $target = e.currentTarget;
    val = $target.value;
    cardType = inputCardType(val) || 'unknown';
    return type(cardType);
};

var formatBackCardNumber = function formatBackCardNumber(e, prop) {
    var $target = void 0,
        value = void 0;
    $target = e.currentTarget;
    value = $target.value;
    if (e.which !== 8) {
        return;
    }
    if ($target.selectionStart != null && $target.selectionStart !== value.length) {
        return;
    }
    if (/\d\s$/.test(value)) {
        e.preventDefault();
        return setTimeout(function () {
            return $target.value = prop(value.replace(/\d\s$/, ''));
        });
    } else if (/\s\d?$/.test(value)) {
        e.preventDefault();
        return setTimeout(function () {
            return $target.value = prop(value.replace(/\d$/, ''));
        });
    }
};

var replaceFullWidthChars = function replaceFullWidthChars(str) {
    var chars = void 0,
        chr = void 0,
        fullWidth = void 0,
        halfWidth = void 0,
        i = void 0,
        idx = void 0,
        len = void 0,
        value = void 0;
    if (str == null) {
        str = '';
    }
    fullWidth = '\uFF10\uFF11\uFF12\uFF13\uFF14\uFF15\uFF16\uFF17\uFF18\uFF19';
    halfWidth = '0123456789';
    value = '';
    chars = str.split('');
    for (i = 0, len = chars.length; i < len; i++) {
        chr = chars[i];
        idx = fullWidth.indexOf(chr);
        if (idx > -1) {
            chr = halfWidth[idx];
        }
        value += chr;
    }
    return value;
};

var safeVal = function safeVal(value, $target, prop) {
    var currPair = void 0,
        cursor = void 0,
        digit = void 0,
        error = void 0,
        error1 = void 0,
        last = void 0,
        prevPair = void 0;
    try {
        cursor = $target.selectionStart;
    } catch (error1) {
        error = error1;
        cursor = null;
    }
    last = $target.value;
    $target.value = prop(value);
    if (cursor !== null && $target === document.activeElement) {
        if (cursor === last.length) {
            cursor = value.length;
        }
        if (last !== value) {
            prevPair = last.slice(cursor - 1, +cursor + 1 || 9e9);
            currPair = value.slice(cursor - 1, +cursor + 1 || 9e9);
            digit = value[cursor];
            if (/\d/.test(digit) && prevPair === digit + ' ' && currPair === ' ' + digit) {
                cursor += 1;
            }
        }
        $target.selectionStart = cursor;
        return $target.selectionEnd = cursor;
    }
};

var reFormatCardNumber = function reFormatCardNumber(e, prop) {
    var $target = e.currentTarget;
    return setTimeout(function () {
        var value = void 0;
        value = $target.value;
        value = replaceFullWidthChars(value);
        value = formatCardNumber(value);
        return safeVal(value, $target, prop);
    });
};

var formatCardNumber = function formatCardNumber(num) {
    var card = void 0,
        groups = void 0,
        ref = void 0,
        upperLength = void 0;
    num = num.replace(/\D/g, '');
    card = cardFromNumber(num);
    if (!card) {
        return num;
    }
    upperLength = card.length[card.length.length - 1];
    num = num.slice(0, upperLength);
    if (card.format.global) {
        return (ref = num.match(card.format)) != null ? ref.join(' ') : void 0;
    }
    groups = card.format.exec(num);
    if (groups == null) {
        return;
    }
    groups.shift();
    groups = _$1.filter(groups, function (n) {
        return n;
    });
    return groups.join(' ');
};

var formatCardInputNumber = function formatCardInputNumber(e, prop) {
    var $target = void 0,
        card = void 0,
        digit = void 0,
        length = void 0,
        re = void 0,
        upperLength = void 0,
        value = void 0;
    digit = String.fromCharCode(e.which);
    if (!/^\d+$/.test(digit)) {
        return;
    }
    $target = e.currentTarget;
    value = $target.value;
    card = cardFromNumber(value + digit);
    length = (value.replace(/\D/g, '') + digit).length;
    upperLength = 16;
    if (card) {
        upperLength = card.length[card.length.length - 1];
    }
    if (length >= upperLength) {
        return;
    }
    if ($target.selectionStart != null && $target.selectionStart !== value.length) {
        return;
    }
    if (card && card.type === 'amex') {
        re = /^(\d{4}|\d{4}\s\d{6})$/;
    } else {
        re = /(?:^|\s)(\d{4})$/;
    }
    if (re.test(value)) {
        e.preventDefault();
        return setTimeout(function () {
            return $target.value = prop(value + ' ' + digit);
        });
    } else if (re.test(value + digit)) {
        e.preventDefault();
        return setTimeout(function () {
            return $target.value = prop(value + digit + ' ');
        });
    }
};

var cardFromNumber = function cardFromNumber(num) {
    var card = void 0,
        i = void 0,
        j = void 0,
        len = void 0,
        len1 = void 0,
        p = void 0,
        pattern = void 0,
        ref = void 0;
    num = ('' + num).replace(/\D/g, '');
    for (i = 0, len = cards.length; i < len; i++) {
        card = cards[i];
        ref = card.patterns;
        for (j = 0, len1 = ref.length; j < len1; j++) {
            pattern = ref[j];
            p = '' + pattern;
            if (num.substr(0, p.length) === p) {
                return card;
            }
        }
    }
};

var hasTextSelected = function hasTextSelected($target) {
    var ref = void 0;
    if ($target.selectionStart != null && $target.selectionStart !== $target.selectionEnd) {
        return true;
    }
    if ((typeof document !== 'undefined' && document !== null ? (ref = document.selection) != null ? ref.createRange : void 0 : void 0) != null) {
        if (document.selection.createRange().text) {
            return true;
        }
    }
    return false;
};

var restrictNumeric = function restrictNumeric(e) {
    var input = void 0;
    if (e.metaKey || e.ctrlKey) {
        return true;
    }
    if (e.which === 32) {
        return false;
    }
    if (e.which === 0) {
        return true;
    }
    if (e.which < 33) {
        return true;
    }
    input = String.fromCharCode(e.which);
    return !!/[\d\s]/.test(input);
};

var restrictCardNumber = function restrictCardNumber(e) {
    var $target = void 0,
        card = void 0,
        digit = void 0,
        value = void 0;
    $target = e.currentTarget;
    digit = String.fromCharCode(e.which);
    if (!/^\d+$/.test(digit)) {
        return;
    }
    if (hasTextSelected($target)) {
        return;
    }
    value = ($target.value + digit).replace(/\D/g, '');
    card = cardFromNumber(value);
    if (card) {
        return value.length <= card.length[card.length.length - 1];
    }
    return value.length <= 16;
};
var setEvents = function setEvents(el, cardType, prop) {
    el.onkeypress = function (event) {
        restrictNumeric(event);
        restrictCardNumber(event);
        formatCardInputNumber(event, prop);
    };
    el.oninput = function (event) {
        reFormatCardNumber(event, prop);
        setCardType(event, cardType);
    };
    el.onkeydown = function (event) {
        return formatBackCardNumber(event, prop);
    };
    el.onkeyup = function (event) {
        setCardType(event, cardType);
    };
    el.onpaste = function (event) {
        return reFormatCardNumber(event, prop);
    };
    el.onchange = function (event) {
        CatarseAnalytics.oneTimeEvent({ cat: 'contribution_finish', act: 'contribution_cc_edit' });
        reFormatCardNumber(event, prop);
    };
};

var luhnCheck = function luhnCheck(num) {
    var digit = void 0,
        digits = void 0,
        i = void 0,
        len = void 0,
        odd = void 0,
        sum = void 0;
    odd = true;
    sum = 0;
    digits = ('' + num).split('').reverse();
    for (i = 0, len = digits.length; i < len; i++) {
        digit = digits[i];
        digit = parseInt(digit, 10);
        if (odd = !odd) {
            digit *= 2;
        }
        if (digit > 9) {
            digit -= 9;
        }
        sum += digit;
    }
    return sum % 10 === 0;
};

var validateCardNumber = function validateCardNumber(num) {
    var card = void 0,
        ref = void 0;
    num = ('' + num).replace(/\s+|-/g, '');
    if (!/^\d+$/.test(num)) {
        return false;
    }
    card = cardFromNumber(num);
    if (!card) {
        return false;
    }
    return (ref = num.length, indexOf.call(card.length, ref) >= 0) && (card.luhn === false || luhnCheck(num));
};

var validateCardExpiry = function validateCardExpiry(month, year) {
    var currentTime = void 0,
        expiry = void 0,
        ref = void 0;
    if ((typeof month === 'undefined' ? 'undefined' : _typeof(month)) === 'object' && 'month' in month) {
        ref = month, month = ref.month, year = ref.year;
    }
    if (!(month && year)) {
        return false;
    }
    month = String(month).trim();
    year = String(year).trim();
    if (!/^\d+$/.test(month)) {
        return false;
    }
    if (!/^\d+$/.test(year)) {
        return false;
    }
    if (!(month >= 1 && month <= 12)) {
        return false;
    }
    if (year.length === 2) {
        if (year < 70) {
            year = '20' + year;
        } else {
            year = '19' + year;
        }
    }
    if (year.length !== 4) {
        return false;
    }
    expiry = new Date(year, month);
    currentTime = new Date();
    expiry.setMonth(expiry.getMonth() - 1);
    expiry.setMonth(expiry.getMonth() + 1, 1);
    return expiry > currentTime;
};

var validateCardcvv = function validateCardcvv(cvv, type) {
    var card = void 0,
        ref = void 0;
    cvv = String(cvv).trim();
    if (!/^\d+$/.test(cvv)) {
        return false;
    }
    card = cardFromType(type);
    if (card != null) {
        return ref = cvv.length, indexOf.call(card.cvvLength, ref) >= 0;
    }
    return cvv.length >= 3 && cvv.length <= 4;
};

var creditCardVM = {
    setEvents: setEvents,
    validateCardNumber: validateCardNumber,
    validateCardcvv: validateCardcvv,
    validateCardExpiry: validateCardExpiry
};

var creditCardInput = {
    controller: function controller(args) {
        var cardType = args.type || m.prop('unknown');
        // TODO: move all input logic to vdom paradigm
        // CreditCard Input still handle events on a dom-based model.
        var setCreditCardHandlers = function setCreditCardHandlers(el, isInitialized) {
            if (!isInitialized) {
                creditCardVM.setEvents(el, cardType, args.value);
            }
        };

        return {
            setCreditCardHandlers: setCreditCardHandlers,
            cardType: cardType
        };
    },
    view: function view(ctrl, args) {
        return m('input.w-input.text-field[name="' + args.name + '"][required="required"][type="tel"]', {
            onfocus: args.onfocus,
            class: args.class,
            config: ctrl.setCreditCardHandlers,
            onblur: args.onblur
        });
    }
};

var I18nScope$43 = _$1.partial(h.i18nScope, 'projects.contributions.edit');
var I18nIntScope$3 = _$1.partial(h.i18nScope, 'projects.contributions.edit_international');

var paymentCreditCard = {
    controller: function controller(args) {
        var vm = args.vm,
            loadingInstallments = m.prop(true),
            loadingSavedCreditCards = m.prop(true),
            selectedCreditCard = m.prop({ id: -1 }),
            selectedInstallment = m.prop('1'),
            showForm = m.prop(false),
            creditCardType = m.prop('unknown'),
            documentMask = _$1.partial(h.mask, '999.999.999-99'),
            documentCompanyMask = _$1.partial(h.mask, '99.999.999/9999-99');

        var onSubmit = function onSubmit() {
            if (selectedCreditCard().id === -1) {
                checkExpiry();
                checkcvv();
                checkCreditCard();
                checkCreditCardName();
            } else {
                vm.creditCardFields.errors([]);
            }

            if (vm.creditCardFields.errors().length === 0) {
                vm.sendPayment(selectedCreditCard, selectedInstallment, args.contribution_id, args.project_id);
            }

            return false;
        };

        var handleValidity = function handleValidity(isValid, errorObj) {
            if (!isValid) {
                vm.creditCardFields.errors().push(errorObj);
            } else {
                var errorsWithout = _$1.reject(vm.creditCardFields.errors(), function (err) {
                    return _$1.isEqual(err, errorObj);
                });
                vm.creditCardFields.errors(errorsWithout);
            }
        };

        var checkcvv = function checkcvv() {
            var isValid = creditCardVM.validateCardcvv(vm.creditCardFields.cvv(), creditCardType()),
                errorObj = { field: 'cvv', message: I18n$1.t('errors.inline.creditcard_cvv', scope()) };

            handleValidity(isValid, errorObj);
        };

        var checkExpiry = function checkExpiry() {
            var isValid = creditCardVM.validateCardExpiry(vm.creditCardFields.expMonth(), vm.creditCardFields.expYear()),
                errorObj = { field: 'expiry', message: I18n$1.t('errors.inline.creditcard_expiry', scope()) };

            handleValidity(isValid, errorObj);
        };

        var checkCreditCard = function checkCreditCard() {
            var isValid = creditCardVM.validateCardNumber(vm.creditCardFields.number()),
                errorObj = { field: 'number', message: I18n$1.t('errors.inline.creditcard_number', scope()) };

            handleValidity(isValid, errorObj);
        };

        var checkCardOwnerDocument = function checkCardOwnerDocument() {
            var document = vm.creditCardFields.cardOwnerDocument(),
                striped = String(document).replace(/[\.|\-|\/]*/g, '');
            var isValid = false,
                errorMessage = '';

            if (document.length > 14) {
                isValid = h.validateCnpj(document);
                errorMessage = 'Invalid CNPJ.';
            } else {
                isValid = h.validateCpf(striped);
                errorMessage = 'Invalid CPF.';
            }

            handleValidity(isValid, { field: 'cardOwnerDocument', message: errorMessage });
        };

        var checkCreditCardName = function checkCreditCardName() {
            var trimmedString = vm.creditCardFields.name().replace(/ /g, '');
            var charsOnly = /^[a-zA-Z]*$/;
            var errorObj = { field: 'name', message: I18n$1.t('errors.inline.creditcard_name', scope()) };
            var isValid = !(_$1.isEmpty(trimmedString) || !charsOnly.test(trimmedString));

            handleValidity(isValid, errorObj);
        };

        var applyCreditCardNameMask = _$1.compose(vm.creditCardFields.name, h.noNumbersMask);

        var applyCvvMask = function applyCvvMask(value) {
            var setValue = h.numbersOnlyMask(value.substr(0, 4));

            return vm.creditCardFields.cvv(setValue);
        };

        var applyDocumentMask = function applyDocumentMask(value) {
            if (value.length > 14) {
                vm.creditCardFields.cardOwnerDocument(documentCompanyMask(value));
            } else {
                vm.creditCardFields.cardOwnerDocument(documentMask(value));
            }
        };

        var fieldHasError = function fieldHasError(fieldName) {
            var fieldWithError = _$1.findWhere(vm.creditCardFields.errors(), { field: fieldName });

            return fieldWithError ? m.component(inlineError, { message: fieldWithError.message }) : '';
        };

        var buildTooltip = function buildTooltip(tooltipText) {
            return m.component(tooltip, {
                el: '.tooltip-wrapper.fa.fa-question-circle.fontcolor-secondary',
                text: tooltipText,
                width: 380
            });
        };

        var isCreditCardSelected = function isCreditCardSelected(card, idx) {
            return selectedCreditCard() === card;
        };

        var loadPagarme = function loadPagarme(el, isInit) {
            if (!isInit) {
                var script = document.createElement('script');
                script.src = '//assets.pagar.me/js/pagarme.min.js';
                document.body.appendChild(script);
                script.onload = function () {
                    vm.pagarme(window.PagarMe);
                };
            }
        };

        var selectCreditCard = function selectCreditCard(card) {
            selectedCreditCard(card);

            if (card.id === -1) {
                showForm(true);
            } else {
                showForm(false);
            }
        };

        var scope = function scope(attr) {
            return vm.isInternational() ? I18nIntScope$3(attr) : I18nScope$43(attr);
        };

        vm.getInstallments(args.contribution_id).then(function () {
            loadingInstallments(false);
            m.redraw();
        });

        vm.getSavedCreditCards(args.user_id).then(function (savedCards) {
            loadingSavedCreditCards(false);
            selectCreditCard(savedCards[0]);
            m.redraw();
        });

        return {
            vm: vm,
            onSubmit: onSubmit,
            fieldHasError: fieldHasError,
            buildTooltip: buildTooltip,
            loadingInstallments: loadingInstallments,
            loadingSavedCreditCards: loadingSavedCreditCards,
            installments: vm.installments,
            selectedInstallment: selectedInstallment,
            savedCreditCards: vm.savedCreditCards,
            creditCard: vm.creditCardFields,
            creditCardType: creditCardType,
            checkCreditCard: checkCreditCard,
            checkCreditCardName: checkCreditCardName,
            applyCreditCardNameMask: applyCreditCardNameMask,
            applyCreditCardMask: vm.applyCreditCardMask,
            applyDocumentMask: applyDocumentMask,
            checkCardOwnerDocument: checkCardOwnerDocument,
            applyCvvMask: applyCvvMask,
            checkcvv: checkcvv,
            selectCreditCard: selectCreditCard,
            isCreditCardSelected: isCreditCardSelected,
            expMonths: vm.expMonthOptions(),
            expYears: vm.expYearOptions(),
            loadPagarme: loadPagarme,
            scope: scope,
            showForm: showForm
        };
    },
    view: function view(ctrl, args) {
        var isInternational = ctrl.vm.isInternational();

        return m('.w-form.u-marginbottom-40', {
            config: ctrl.loadPagarme
        }, [m('form[name="email-form"]', {
            onsubmit: ctrl.onSubmit
        }, [!ctrl.loadingSavedCreditCards() && ctrl.savedCreditCards().length > 1 ? m('.my-credit-cards.w-form.back-payment-form-creditcard.records-choice.u-marginbottom-40', _$1.map(ctrl.savedCreditCards(), function (card, idx) {
            return m('div#credit-card-record-' + idx + '.w-row.creditcard-records', {
                style: 'cursor:pointer;',
                onclick: function onclick() {
                    return ctrl.selectCreditCard(card);
                }
            }, [m('.w-col.w-col-1.w-sub-col', m('.w-radio.w-clearfix.back-payment-credit-card-radio-field', m('input', {
                checked: ctrl.isCreditCardSelected(card, idx),
                name: 'payment_subscription_card',
                type: 'radio',
                value: card.card_key
            }))), card.id === -1 ? m('.w-col.w-col-11', m('.fontsize-small.fontweight-semibold.fontcolor-secondary', I18n$1.t('credit_card.use_another', ctrl.scope()))) : [m('.w-col.w-col-2.w-sub-col.w-sub-col-middle', m('.fontsize-small.fontweight-semibold.text-success', card.card_brand.toUpperCase())), m('.w-col.w-col-5.w-sub-col.w-sub-col-middle', m('.fontsize-small.fontweight-semibold.u-marginbottom-20', 'XXXX.XXXX.XXXX.' + card.last_digits)), m('.w-col.w-col-4', ctrl.loadingInstallments() || ctrl.installments().length <= 1 ? '' : m('select.w-select.text-field.text-field-creditcard', {
                onchange: m.withAttr('value', ctrl.selectedInstallment),
                value: ctrl.selectedInstallment()
            }, _$1.map(ctrl.installments(), function (installment) {
                return m('option[value="' + installment.number + '"]', installment.number + ' X Rs ' + installment.amount);
            })))]]);
        })) : ctrl.loadingSavedCreditCards() ? m('.fontsize-small.u-marginbottom-40', I18n$1.t('credit_card.loading', ctrl.scope())) : '', !ctrl.showForm() ? '' : m('#credit-card-payment-form.u-marginbottom-40', [m('div#credit-card-name', [m('.w-row', [m(isInternational ? '.w-col.w-col-12' : '.w-col.w-col-6.w-col-tiny-6.w-sub-col-middle', [m('label.field-label.fontweight-semibold[for="credit-card-name"]', I18n$1.t('credit_card.name', ctrl.scope())), m('.fontsize-smallest.fontcolor-terciary.u-marginbottom-10.field-label-tip.u-marginbottom-10', I18n$1.t('credit_card.name_tip', ctrl.scope())), m('input.w-input.text-field[name="credit-card-name"][type="text"]', {
            onfocus: ctrl.vm.resetCreditCardFieldError('name'),
            class: ctrl.fieldHasError('name') ? 'error' : '',
            onblur: ctrl.checkCreditCardName,
            onkeyup: m.withAttr('value', ctrl.applyCreditCardNameMask),
            value: ctrl.creditCard.name()
        }), ctrl.fieldHasError('name')]), !isInternational ? m('.w-col.w-col-6.w-col-tiny-6.w-sub-col-middle', [m('label.field-label.fontweight-semibold[for="credit-card-document"]', I18n$1.t('credit_card.document', ctrl.scope())), m('.fontsize-smallest.fontcolor-terciary.u-marginbottom-10.field-label-tip.u-marginbottom-10', I18n$1.t('credit_card.document_tip', ctrl.scope())), m('input.w-input.text-field[name="credit-card-document"]', {
            onfocus: ctrl.vm.resetCreditCardFieldError('cardOwnerDocument'),
            class: ctrl.fieldHasError('cardOwnerDocument') ? 'error' : '',
            onblur: ctrl.checkCardOwnerDocument,
            onkeyup: m.withAttr('value', ctrl.applyDocumentMask),
            value: ctrl.creditCard.cardOwnerDocument()
        }), ctrl.fieldHasError('cardOwnerDocument')]) : ''])]), m('div#credit-card-number', [m('label.field-label.fontweight-semibold[for="credit-card-number"]', I18n$1.t('credit_card.number', ctrl.scope())), m('.fontsize-smallest.fontcolor-terciary.u-marginbottom-10.field-label-tip.u-marginbottom-10', I18n$1.t('credit_card.number_tip', ctrl.scope())), m.component(creditCardInput, {
            onfocus: ctrl.vm.resetCreditCardFieldError('number'),
            onblur: ctrl.checkCreditCard,
            class: ctrl.fieldHasError('number') ? 'error' : '',
            value: ctrl.creditCard.number,
            name: 'credit-card-number',
            type: ctrl.creditCardType
        }), ctrl.fieldHasError('number')]), m('div#credit-card-date', [m('label.field-label.fontweight-semibold[for="expiration-date"]', [I18n$1.t('credit_card.expiry', ctrl.scope())]), m('.fontsize-smallest.fontcolor-terciary.u-marginbottom-10.field-label-tip.u-marginbottom-10', I18n$1.t('credit_card.expiry_tip', ctrl.scope())), m('.w-row', [m('.w-col.w-col-6.w-col-tiny-6.w-sub-col-middle', m('select.w-select.text-field[name="expiration-date_month"]', {
            onfocus: ctrl.vm.resetCreditCardFieldError('expiry'),
            class: ctrl.fieldHasError('expiry') ? 'error' : '',
            onchange: m.withAttr('value', ctrl.creditCard.expMonth),
            value: ctrl.creditCard.expMonth()
        }, _$1.map(ctrl.expMonths, function (month) {
            return m('option', { value: month[0] }, month[1]);
        }))), m('.w-col.w-col-6.w-col-tiny-6', m('select.w-select.text-field[name="expiration-date_year"]', {
            onfocus: ctrl.vm.resetCreditCardFieldError('expiry'),
            class: ctrl.fieldHasError('expiry') ? 'error' : '',
            onchange: m.withAttr('value', ctrl.creditCard.expYear),
            onblur: ctrl.checkExpiry,
            value: ctrl.creditCard.expYear()
        }, _$1.map(ctrl.expYears, function (year) {
            return m('option', { value: year }, year);
        }))), m('.w-col.w-col-12', ctrl.fieldHasError('expiry'))])]), m('div#credit-card-cvv', [m('label.field-label.fontweight-semibold[for="credit-card-cvv"]', [I18n$1.t('credit_card.cvv', ctrl.scope()), ctrl.buildTooltip(I18n$1.t('credit_card.cvv_tooltip', ctrl.scope()))]), m('.fontsize-smallest.fontcolor-terciary.u-marginbottom-10.field-label-tip.u-marginbottom-10', I18n$1.t('credit_card.cvv_tip', ctrl.scope())), m('.w-row', [m('.w-col.w-col-8.w-col-tiny-6.w-sub-col-middle', m('input.w-input.text-field[name="credit-card-cvv"][type="tel"]', {
            onfocus: ctrl.vm.resetCreditCardFieldError('cvv'),
            class: ctrl.fieldHasError('cvv') ? 'error' : '',
            onkeyup: m.withAttr('value', ctrl.applyCvvMask),
            onblur: ctrl.checkcvv,
            value: ctrl.creditCard.cvv()
        }), ctrl.fieldHasError('cvv')), m('.w-col.w-col-4.w-col-tiny-6.u-text-center', m('img[src="https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/57298c1c7e99926e77127bdd_cvv-card.jpg"][width="176"]'))])]), ctrl.loadingInstallments() || ctrl.installments().length <= 1 ? '' : m('.w-row', [m('.w-col.w-col-6', [m('label.field-label.fontweight-semibold[for="split"]', I18n$1.t('credit_card.installments', ctrl.scope())), m('select.w-select.text-field[name="split"]', {
            onchange: m.withAttr('value', ctrl.selectedInstallment),
            value: ctrl.selectedInstallment()
        }, _$1.map(ctrl.installments(), function (installment) {
            return m('option[value="' + installment.number + '"]', installment.number + ' X Rs ' + installment.amount);
        }))]), m('.w-col.w-col-6')]), m('.w-checkbox.w-clearfix', [m('input#payment_save_card.w-checkbox-input[type="checkbox"][name="payment_save_card"]', {
            onchange: m.withAttr('checked', ctrl.creditCard.save),
            checked: ctrl.creditCard.save()
        }), m('label.w-form-label[for="payment_save_card"]', I18n$1.t('credit_card.save_card', ctrl.scope()))])]), m('.w-row', [m('.w-col.w-col-8.w-col-push-2', [!_$1.isEmpty(ctrl.vm.submissionError()) ? m('.card.card-error.u-radius.zindex-10.u-marginbottom-30.fontsize-smaller', m('.u-marginbottom-10.fontweight-bold', m.trust(ctrl.vm.submissionError()))) : '', ctrl.vm.isLoading() ? h.loader() : m('input.btn.btn-large.u-marginbottom-20[type="submit"]', { value: I18n$1.t('credit_card.finish_payment', ctrl.scope()) }), m('.fontsize-smallest.u-text-center.u-marginbottom-30', m.trust(I18n$1.t('credit_card.terms_of_use_agreement', ctrl.scope())))])])])]);
    }
};

var I18nScope$41 = _$1.partial(h.i18nScope, 'projects.contributions.edit');
var I18nIntScope$2 = _$1.partial(h.i18nScope, 'projects.contributions.edit_international');

var paymentForm = {
    controller: function controller(args) {
        var isSlip = m.prop(false),
            scope = function scope() {
            return args.vm.isInternational() ? I18nIntScope$2() : I18nScope$41();
        };
        return {
            isSlip: isSlip,
            scope: scope,
            vm: args.vm
        };
    },
    view: function view(ctrl, args) {
        return m('#catarse_pagarme_form', [m('.u-text-center-small-only.u-marginbottom-30', [m('.fontsize-large.fontweight-semibold', I18n$1.t('payment_info', ctrl.scope())), m('.fontsize-smallest.fontcolor-secondary.fontweight-semibold', [m('span.fa.fa-lock'), I18n$1.t('safe_payment', ctrl.scope())])]), m('.flex-row.u-marginbottom-40', [m('a.w-inline-block.btn-select.flex-column.u-marginbottom-20.u-text-center[href=\'javascript:void(0);\']', {
            onclick: function onclick() {
                return ctrl.isSlip(false);
            },
            class: !ctrl.isSlip() ? 'selected' : ''
        }, [m('.fontsize-base.fontweight-semibold', I18n$1.t('credit_card_select', ctrl.scope())), m('.fontcolor-secondary.fontsize-smallest.u-marginbottom-20', I18n$1.t('debit_card_info', ctrl.scope())), m('img[src=\'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/57299bd8f326a24d4828a0fd_credit-cards.png\']')]), !args.vm.isInternational() ? m('a.w-inline-block.btn-select.flex-column.u-marginbottom-20.u-text-center[href=\'javascript:void(0);\']', {
            onclick: function onclick() {
                return ctrl.isSlip(true);
            },
            class: ctrl.isSlip() ? 'selected' : ''
        }, [m('.fontsize-base.fontweight-semibold.u-marginbottom-20', 'Bank slip'), m('img[src=\'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/57299c6ef96a6e44489a7a07_boleto.png\'][width=\'48\']')]) : m('.flex-column')]), !ctrl.isSlip() ? m('#credit-card-section', [m.component(paymentCreditCard, { vm: args.vm, contribution_id: args.contribution_id, project_id: args.project_id, user_id: args.user_id })]) : !args.vm.isInternational() ? m('#boleto-section', [m.component(paymentSlip, { vm: args.vm, contribution_id: args.contribution_id, project_id: args.project_id })]) : '']);
    }
};

// import UserOwnerBox from '../c/user-owner-box';

var I18nScope$40 = _$1.partial(h.i18nScope, 'projects.contributions.edit');
var I18nIntScope$1 = _$1.partial(h.i18nScope, 'projects.contributions.edit_international');

var projectsPayment = {
    controller: function controller(args) {
        var project = projectVM.currentProject,
            vm = paymentVM(),
            showPaymentForm = m.prop(false),
            contribution = contributionVM.getCurrentContribution(),
            reward = m.prop(contribution().reward),
            value = contribution().value,
            phoneMask = _$1.partial(h.mask, '(99) 9999-99999'),
            documentMask = _$1.partial(h.mask, '999.999.999-99'),
            documentCompanyMask = _$1.partial(h.mask, '99.999.999/9999-99'),
            zipcodeMask = _$1.partial(h.mask, '99999-999'),
            isCnpj = m.prop(false),
            currentUserID = h.getUserID(),
            user = userVM.getCurrentUser();

        var shippingFee = function shippingFee() {
            return _$1.findWhere(rewardVM.fees(), { id: contribution().shipping_fee_id });
        };

        var validateForm = function validateForm() {
            if (vm.validate()) {
                vm.similityExecute(contribution().id);

                var userData = {
                    // country_id: fields.country_id(),
                    country_id: 168,
                    address_street: vm.fields.street(),
                    address_city: vm.fields.city(),
                    phone_number: document.getElementById('phone').value,
                    cpf: vm.fields.ownerDocument(),
                    name: vm.fields.completeName()
                };
                m.request({
                    method: 'PUT',
                    url: '/users/' + currentUserID + '.json',
                    data: {
                        user: userData
                    },
                    config: h.setCsrfToken
                });

                var contributionData = {
                    // anonymous: fields.anonymous(),
                    country_id: 168,
                    payer_name: vm.fields.completeName(),
                    payer_document: vm.fields.ownerDocument(),
                    address_street: vm.fields.street(),
                    // address_number: fields.number(),
                    // address_complement: fields.addressComplement(),
                    // address_neighbourhood: fields.neighbourhood(),
                    // address_zip_code: fields.zipCode(),
                    address_city: vm.fields.city(),
                    // address_state: fields.userState(),
                    address_phone_number: vm.fields.phone()
                };
                m.request({
                    method: 'PUT',
                    url: '/projects/' + projectVM.currentProject().project_id + '/contributions/' + contribution().id + '.json',
                    data: { contribution: contributionData },
                    config: h.setCsrfToken
                });

                return h.navigateTo('/projects/' + projectVM.currentProject().project_id + '/contributions/' + contribution().id + '/payment_method');
            }
        };

        var fieldHasError = function fieldHasError(fieldName) {
            var fieldWithError = _$1.findWhere(vm.fields.errors(), {
                field: fieldName
            });

            return fieldWithError ? m.component(inlineError, {
                message: fieldWithError.message
            }) : '';
        };

        var setStateOther = function setStateOther(el, isInit) {
            if (!isInit) {
                vm.fields.userState('');
            }
        };

        var applyDocumentMask = function applyDocumentMask(value) {
            if (value.length > 14) {
                isCnpj(true);
                vm.fields.ownerDocument(documentCompanyMask(value));
            } else {
                isCnpj(false);
                vm.fields.ownerDocument(documentMask(value));
            }
        };

        var applyZipcodeMask = _$1.compose(vm.fields.zipCode, zipcodeMask);

        var applyPhoneMask = _$1.compose(vm.fields.phone, phoneMask);

        var addressChange = function addressChange(fn) {
            return function (e) {
                CatarseAnalytics.oneTimeEvent({
                    cat: 'contribution_finish',
                    act: vm.isInternational ? 'contribution_address_br' : 'contribution_address_int'
                });

                if (_$1.isFunction(fn)) {
                    fn(e);
                }
            };
        };

        var scope = function scope(attr) {
            return vm.isInternational() ? I18nIntScope$1(attr) : I18nScope$40(attr);
        };

        var isLongDescription = function isLongDescription(reward) {
            return reward.description && reward.description.length > 110;
        };

        if (_$1.isNull(currentUserID)) {
            return h.navigateToDevise();
        }
        rewardVM.getStates();
        rewardVM.getFees(reward()).then(rewardVM.fees);
        vm.similityExecute(contribution().id);
        projectVM.getCurrentProject();

        return {
            addressChange: addressChange,
            applyDocumentMask: applyDocumentMask,
            applyZipcodeMask: applyZipcodeMask,
            applyPhoneMask: applyPhoneMask,
            fieldHasError: fieldHasError,
            setStateOther: setStateOther,
            validateForm: validateForm,
            showPaymentForm: showPaymentForm,
            contribution: contribution,
            reward: reward,
            value: value,
            scope: scope,
            isCnpj: isCnpj,
            vm: vm,
            user: user,
            project: project,
            shippingFee: shippingFee,
            isLongDescription: isLongDescription,
            toggleDescription: h.toggleProp(false, true)
        };
    },
    view: function view(ctrl) {
        var user = ctrl.user(),
            project = ctrl.project,

        // formatedValue = h.formatNumber(Number(ctrl.value), 2, 3);
        formatedValue = Number(ctrl.value);
        return m('#project-payment.w-section.w-clearfix.section', !_$1.isEmpty(project) ? [m('.w-col', m('.w-clearfix.w-hidden-main.w-hidden-medium.card.u-radius.u-marginbottom-20', [m('.fontsize-smaller.fontweight-semibold.u-marginbottom-20', I18n$1.t('selected_reward.value', ctrl.scope())), m('.w-clearfix', [m('.fontsize-larger.text-success.u-left', 'Rs ' + formatedValue)
        // m(`a.alt-link.fontsize-smaller.u-right[href="/projects/${projectVM.currentProject().project_id}/contributions/new${ctrl.reward().id ? `?reward_id=${ctrl.reward().id}` : ''}"]`,
        //     'Edit'
        // )
        ]), m('.divider.u-marginbottom-10.u-margintop-10'), m('.back-payment-info-reward', [m('.fontsize-smaller.fontweight-semibold.u-marginbottom-10', I18n$1.t('selected_reward.reward', ctrl.scope())), m('.fontsize-smallest.fontweight-semibold', ctrl.reward().title), m('.fontsize-smallest.reward-description.opened.fontcolor-secondary', {
            class: ctrl.isLongDescription(ctrl.reward()) ? ctrl.toggleDescription() ? 'extended' : '' : 'extended'
        }, ctrl.reward().description ? ctrl.reward().description : ''), ctrl.isLongDescription(ctrl.reward()) ? m('a[href="javascript:void(0);"].link-hidden.link-more.u-marginbottom-20', {
            onclick: ctrl.toggleDescription.toggle
        }, [ctrl.toggleDescription() ? 'less ' : 'more ', m('span.fa.fa-angle-down', {
            class: ctrl.toggleDescription() ? 'reversed' : ''
        })]) : '', ctrl.reward().deliver_at ? m('.fontcolor-secondary.fontsize-smallest.u-margintop-10', [m('span.fontweight-semibold', 'Estimated delivery time:'), ' ' + h.momentify(ctrl.reward().deliver_at, 'MMM/YYYY')]) : '', rewardVM.hasShippingOptions(ctrl.reward()) || ctrl.reward().shipping_options === 'presential' ? m('.fontcolor-secondary.fontsize-smallest', [m('span.fontweight-semibold', 'Shipping method: '), I18n$1.t('shipping_options.' + ctrl.reward().shipping_options, { scope: 'projects.contributions' })]) : ''])])), m('.w-container', m('.w-row', [m('.w-col.w-col-8', [m('.w-form', [m('form.u-marginbottom-40', [m('.u-marginbottom-40.u-text-center-small-only', [m('.fontweight-semibold.lineheight-tight.fontsize-large', I18n$1.t('title', ctrl.scope())), m('.fontsize-smaller', I18n$1.t('required', ctrl.scope()))]),
        // user.name && user.owner_document ? m(UserOwnerBox, { user, project }) : '',
        // m('.w-row.u-marginbottom-30', [
        //     m('.w-col.w-col-7.w-sub-col', [
        //         m('label.field-label.fontweight-semibold[for=\'country\']', [
        //             'Country ',
        //             ' *'
        //         ]),
        //         m('select.w-select.text-field[id=\'country\']', {
        //             onfocus: ctrl.vm.resetFieldError('userCountryId'),
        //             class: ctrl.fieldHasError('userCountryId') ? 'error' : false,
        //             onchange: m.withAttr('value', ctrl.vm.fields.userCountryId),
        //             value: ctrl.vm.fields.userCountryId()
        //         },
        //             _.map(ctrl.vm.fields.countries(), (country, idx) => m('option', {
        //                 value: country.id,
        //                 key: idx,
        //                 selected: country.id === ctrl.vm.fields.userCountryId()
        //             }, country.name))
        //         ),
        //         ctrl.fieldHasError('userCountryId')
        //     ]),
        //     m('.w-col.w-col-5')
        // ]),
        user.name && user.owner_document ? '' : m('.w-row', [m('.w-col.w-col-7.w-sub-col', [m('label.field-label.fontweight-semibold[for=\'complete-name\']', I18n$1.t('fields.complete_name', ctrl.scope())), m('input.w-input.text-field[id=\'complete-name\'][name=\'complete-name\']', {
            onfocus: ctrl.vm.resetFieldError('completeName'),
            class: ctrl.fieldHasError('completeName') ? 'error' : false,
            type: 'text',
            onchange: m.withAttr('value', ctrl.vm.fields.completeName),
            value: ctrl.vm.fields.completeName(),
            placeholder: 'Full name'
        }), ctrl.fieldHasError('completeName')]), m('.w-col.w-col-5', !ctrl.vm.isInternational() ? '' : [m('label.field-label.fontweight-semibold[for=\'document\']', 'PAN'), m('input.w-input.text-field[id=\'document\']', {
            onfocus: ctrl.vm.resetFieldError('ownerDocument'),
            class: ctrl.fieldHasError('ownerDocument') ? 'error' : false,
            type: 'tel',
            onchange: m.withAttr('value', ctrl.vm.fields.ownerDocument),
            // onkeyup: m.withAttr('value', ctrl.applyDocumentMask),
            value: ctrl.vm.fields.ownerDocument()
        }), ctrl.fieldHasError('ownerDocument')])]),
        // m('.w-checkbox.w-clearfix', [
        //     m('input.w-checkbox-input[id=\'anonymous\'][name=\'anonymous\'][type=\'checkbox\']', {
        //         onclick: () => CatarseAnalytics.event({ cat: 'contribution_finish', act: 'contribution_anonymous_change' }),
        //         onchange: m.withAttr('value', ctrl.vm.fields.anonymous),
        //         checked: ctrl.vm.fields.anonymous(),
        //     }),
        //     m('label.w-form-label.fontsize-smallest[for=\'anonymous\']',
        //         I18n.t('fields.anonymous', ctrl.scope())
        //     )
        // ]),
        ctrl.vm.fields.anonymous() ? m('.card.card-message.u-radius.zindex-10.fontsize-smallest', m('div', [m('span.fontweight-bold', [I18n$1.t('anonymous_confirmation_title', ctrl.scope()), m('br')]), m('br'), I18n$1.t('anonymous_confirmation', ctrl.scope())])) : ''])]), m('.u-marginbottom-40', m('.w-form', [
        // m('label.field-label.fontweight-semibold[for=\'street\']',
        //     I18n.t('fields.street', ctrl.scope())
        // ),
        // m('input.w-input.text-field[id=\'street\']', {
        //     type: 'text',
        //     onfocus: ctrl.vm.resetFieldError('street'),
        //     class: ctrl.fieldHasError('street') ? 'error' : false,
        //     onchange: ctrl.addressChange(m.withAttr('value', ctrl.vm.fields.street)),
        //     value: ctrl.vm.fields.street(),
        //     placeholder: 'My Home Street'
        // }),
        // ctrl.fieldHasError('street'),
        // m('.w-row', ctrl.vm.isInternational() ? '' : [
        //     m('.w-col.w-col-4.w-sub-col', [
        //         m('label.field-label.fontweight-semibold[for=\'number\']',
        //             I18n.t('fields.street_number', ctrl.scope())
        //         ),
        //         m('input.w-input.text-field[id=\'number\']', {
        //             onfocus: ctrl.vm.resetFieldError('number'),
        //             class: ctrl.fieldHasError('number') ? 'error' : false,
        //             type: 'text',
        //             onchange: ctrl.addressChange(m.withAttr('value', ctrl.vm.fields.number)),
        //             value: ctrl.vm.fields.number(),
        //             placeholder: '421'
        //         }),
        //         ctrl.fieldHasError('number')
        //     ]),
        //     m('.w-col.w-col-4.w-sub-col', [
        //         m('label.field-label.fontweight-semibold[for=\'address-complement\']',
        //             I18n.t('fields.street_complement', ctrl.scope())
        //         ),
        //         m('input.w-input.text-field[id=\'address-complement\']', {
        //             onfocus: ctrl.vm.resetFieldError('addressComplement'),
        //             class: ctrl.fieldHasError('addressComplement') ? 'error' : false,
        //             type: 'text',
        //             onchange: ctrl.addressChange(m.withAttr('value', ctrl.vm.fields.addressComplement)),
        //             value: ctrl.vm.fields.addressComplement(),
        //             placeholder: 'Residential 123'
        //         }),
        //         ctrl.fieldHasError('addressComplement')
        //     ]),
        //     m('.w-col.w-col-4', ctrl.vm.isInternational() ? '' : [
        //         m('label.field-label.fontweight-semibold[for=\'neighbourhood\']',
        //             I18n.t('fields.neighbourhood', ctrl.scope())
        //         ),
        //         m('input.w-input.text-field[id=\'neighbourhood\']', {
        //             onfocus: ctrl.vm.resetFieldError('neighbourhood'),
        //             class: ctrl.fieldHasError('neighbourhood') ? 'error' : false,
        //             type: 'text',
        //             onchange: ctrl.addressChange(m.withAttr('value', ctrl.vm.fields.neighbourhood)),
        //             value: ctrl.vm.fields.neighbourhood(),
        //             placeholder: 'São José'
        //         }),
        //         ctrl.fieldHasError('neighbourhood')
        //     ])
        // ]),
        m('.w-row', [m('.w-col.w-col-4.w-sub-col', [m('label.field-label.fontweight-semibold[for=\'street\']', I18n$1.t('fields.street', ctrl.scope())), m('input.w-input.text-field[id=\'street\']', {
            type: 'text',
            onfocus: ctrl.vm.resetFieldError('street'),
            class: ctrl.fieldHasError('street') ? 'error' : false,
            onchange: ctrl.addressChange(m.withAttr('value', ctrl.vm.fields.street)),
            value: ctrl.vm.fields.street(),
            placeholder: 'My Home Street'
        }), ctrl.fieldHasError('street')]),
        // m('.w-col.w-col-4.w-sub-col', [
        //     m('label.field-label.fontweight-semibold[for=\'zip-code\']',
        //         I18n.t('fields.zipcode', ctrl.scope())
        //     ),
        //     m('input.w-input.text-field[id=\'zip-code\']', {
        //         type: 'tel',
        //         onfocus: ctrl.vm.resetFieldError('zipCode'),
        //         class: ctrl.fieldHasError('zipCode') ? 'error' : false,
        //         onchange: ctrl.addressChange(),
        //         onkeyup: m.withAttr('value', value => !ctrl.vm.isInternational() ? ctrl.applyZipcodeMask(value) : ctrl.vm.fields.zipCode(value)),
        //         value: ctrl.vm.fields.zipCode(),
        //         placeholder: '42100000'
        //     }),
        //     ctrl.fieldHasError('zipCode')
        // ]),
        m('.w-col.w-col-4.w-sub-col', [m('label.field-label.fontweight-semibold[for=\'city\']', I18n$1.t('fields.city', ctrl.scope())), m('input.w-input.text-field[id=\'city\']', {
            onfocus: ctrl.vm.resetFieldError('city'),
            class: ctrl.fieldHasError('city') ? 'error' : false,
            type: 'text',
            onchange: ctrl.addressChange(m.withAttr('value', ctrl.vm.fields.city)),
            value: ctrl.vm.fields.city(),
            placeholder: 'City'
        }), ctrl.fieldHasError('city')])]), ctrl.vm.isInternational() ? m('.w-row', [m('.w-col.w-col-6', [m('label.field-label.fontweight-semibold[for=\'phone\']', I18n$1.t('fields.phone', ctrl.scope())), m('input.w-input.text-field[id=\'phone\']', {
            onfocus: ctrl.vm.resetFieldError('phone'),
            class: ctrl.fieldHasError('phone') ? 'error' : false,
            type: 'tel',
            onchange: m.withAttr('value', ctrl.vm.fields.phone),
            // onkeyup: m.withAttr('value', ctrl.applyPhoneMask),
            value: ctrl.vm.fields.phone()
        }), ctrl.fieldHasError('phone')])]) : ''])), m('.w-row.u-marginbottom-40', !ctrl.showPaymentForm() ? m('.w-col.w-col-push-3.w-col-6', m('button.btn.btn-large[type=submit]', {
            onclick: function onclick() {
                return CatarseAnalytics.event({ cat: 'contribution_finish', act: 'contribution_next_click' }, ctrl.validateForm);
            }
        }, I18n$1.t('next_step', ctrl.scope()))) : ''), ctrl.showPaymentForm() ? m.component(paymentForm, {
            vm: ctrl.vm,
            contribution_id: ctrl.contribution().id,
            project_id: projectVM.currentProject().project_id,
            user_id: user.id
        }) : '']), m('.w-col.w-col-4', [m('.card.u-marginbottom-20.u-radius.w-hidden-small.w-hidden-tiny', [m('.fontsize-smaller.fontweight-semibold.u-marginbottom-20', I18n$1.t('selected_reward.value', ctrl.scope())), m('.w-clearfix', [m('.fontsize-larger.text-success.u-left', 'Rs ' + formatedValue)
        // m(`a.alt-link.fontsize-smaller.u-right[href="/projects/${projectVM.currentProject().project_id}/contributions/new${ctrl.reward().id ? `?reward_id=${ctrl.reward().id}` : ''}"]`,
        //     'Edit'
        // )
        ]), m('.divider.u-marginbottom-10.u-margintop-10'), m('.back-payment-info-reward', [m('.fontsize-smaller.fontweight-semibold.u-marginbottom-10', I18n$1.t('selected_reward.reward', ctrl.scope())), m('.fontsize-smallest.fontweight-semibold', ctrl.reward().title), m('.fontsize-smallest.reward-description.opened.fontcolor-secondary', {
            class: ctrl.isLongDescription(ctrl.reward()) ? ctrl.toggleDescription() ? 'extended' : '' : 'extended'
        }, ctrl.reward().description ? ctrl.reward().description : ''), ctrl.isLongDescription(ctrl.reward()) ? m('a[href="javascript:void(0);"].link-hidden.link-more.u-marginbottom-20', {
            onclick: ctrl.toggleDescription.toggle
        }, [ctrl.toggleDescription() ? 'menos ' : 'mais ', m('span.fa.fa-angle-down', {
            class: ctrl.toggleDescription() ? 'reversed' : ''
        })]) : '', ctrl.reward().deliver_at ? m('.fontcolor-secondary.fontsize-smallest.u-margintop-10', [m('span.fontweight-semibold', 'Entrega prevista:'), ' ' + h.momentify(ctrl.reward().deliver_at, 'MMM/YYYY')]) : '', rewardVM.hasShippingOptions(ctrl.reward()) || ctrl.reward().shipping_options === 'presential' ? m('.fontcolor-secondary.fontsize-smallest', [m('span.fontweight-semibold', 'Forma de envio: '), I18n$1.t('shipping_options.' + ctrl.reward().shipping_options, { scope: 'projects.contributions' })]) : '', m('div')])])
        // m.component(faqBox, {
        //     mode: project.mode,
        //     vm: ctrl.vm,
        //     faq: ctrl.vm.faq(project.mode),
        //     projectUserId: project.user_id
        // })
        ])]))] : h.loader());
    }
};

var projectsReward = {
    controller: function controller(args) {
        var vm = rewardVM,
            selectedReward = vm.selectedReward,
            selectReward = vm.selectReward,
            rewards = vm.rewards(),
            mode = projectVM.currentProject().mode,
            faq = I18n$1.translations[I18n$1.currentLocale()].projects.faq[mode];

        // TODO unify projectsReward and project-reward-list reward submission. fix routing issue.
        var submitContribution = function submitContribution() {
            var valueFloat = h.monetaryToFloat(vm.contributionValue);

            if (valueFloat < vm.selectedReward().minimum_value) {
                vm.error('The support amount for this reward must be at least Rs' + vm.selectedReward().minimum_value);
            } else if (!h.getUser()) {
                h.storeObject(storeKey, { value: valueFloat, reward: vm.selectedReward() });

                return h.navigateToDevise('/' + projectVM.currentProject().permalink);
            } else {
                vm.error('');
                vm.contributionValue(valueFloat);
                m.route('/projects/' + projectVM.currentproject().project_id + '/payment', {
                    project_user_id: projectVM.currentProject().user_id
                });
            }

            return false;
        };

        var isSelected = function isSelected(reward) {
            return reward.id === selectedReward().id;
        };

        if (_$1.first(rewards).id !== vm.noReward.id) {
            rewards.unshift(vm.noReward);
        }

        return {
            rewards: rewards,
            project: projectVM.currentProject,
            contributionValue: vm.contributionValue,
            submitContribution: submitContribution,
            applyMask: vm.applyMask,
            error: vm.error,
            isSelected: isSelected,
            selectedReward: selectedReward,
            selectReward: selectReward,
            faq: faq
        };
    },
    view: function view(ctrl, args) {
        var project = ctrl.project;

        return m('#project-rewards', [m('.w-section.page-header.u-text-center', [m('.w-container', [m('h1.fontsize-larger.fontweight-semibold.project-name[itemprop="name"]', h.selfOrEmpty(project().name || project().project_name)), m('h2.fontsize-base.lineheight-looser[itemprop="author"]', ['by ', project().user ? project().user.name : project().owner_name ? project().owner_name : ''])])]), m('.w-section.header-cont-new', m('.w-container', m('.fontweight-semibold.lineheight-tight.text-success.fontsize-large.u-text-center-small-only', 'Choose the reward and then the value of the support'))), m('.section[id=\'new-contribution\']', m('.w-container', m('.w-row', [m('.w-col.w-col-8', m('.w-form.back-reward-form', m('form.simple_form.new_contribution', {
            onsubmit: ctrl.submitContribution
        }, _$1.map(ctrl.rewards, function (reward, index) {
            var isSelected = ctrl.isSelected(reward),
                monetaryMinimum = h.applyMonetaryMask(reward.minimum_value);

            return m('span.radio.w-radio.w-clearfix.back-reward-radio-reward', {
                class: isSelected ? 'selected' : '',
                onclick: ctrl.selectReward(reward),
                key: index
            }, m('label[for=\'contribution_reward_id_' + reward.id + '\']', [m('input.radio_buttons.optional.w-input.text-field.w-radio-input.back-reward-radio-button[id=\'contribution_reward_id_' + reward.id + '\'][name=\'contribution[reward_id]\'][type=\'radio\'][value=\'' + reward.id + '\']', {
                checked: !!isSelected
            }), m('label.w-form-label.fontsize-base.fontweight-semibold.u-marginbottom-10[for=\'contribution_reward_' + reward.id + '\']', reward.id === -1 ? 'I do not want any reward' : 'Rs ' + reward.minimum_value + ' or more'), isSelected ? m('.w-row.back-reward-money', [m('.w-col.w-col-8.w-col-small-8.w-col-tiny-8.w-sub-col-middle.w-clearfix', [m('.w-row', [m('.w-col.w-col-3.w-col-small-3.w-col-tiny-3', m('.back-reward-input-reward.placeholder', 'Rs')), m('.w-col.w-col-9.w-col-small-9.w-col-tiny-9', m('input.user-reward-value.back-reward-input-reward[autocomplete=\'off\'][type=\'tel\']', {
                class: ctrl.error() ? 'error' : '',
                min: monetaryMinimum,
                placeholder: monetaryMinimum,
                onkeyup: m.withAttr('value', ctrl.applyMask),
                value: ctrl.contributionValue()
            }))]), ctrl.error().length > 0 ? m('.text-error', [m('br'), m('span.fa.fa-exclamation-triangle'), ' ' + ctrl.error()]) : '']), m('.submit-form.w-col.w-col-4.w-col-small-4.w-col-tiny-4', m('button.btn.btn-large', ['Continue  ', m('span.fa.fa-chevron-right')]))]) : '', m('.back-reward-reward-description', [m('.fontsize-smaller.u-marginbottom-10', reward.description), reward.deliver_at ? m('.fontsize-smallest.fontcolor-secondary', 'Estimated delivery: ' + h.momentify(reward.deliver_at, 'MMM/YYYY')) : ''])])); // End map return
        })))), m('.w-col.w-col-4', m.component(faqBox, { mode: ctrl.project().mode, faq: ctrl.faq }))])))]);
    }
};

var I18nScope$44 = _$1.partial(h.i18nScope, 'projects.publish');

var publish = {
    controller: function controller(args) {
        var filtersVM = postgrest$1.filtersVM({
            project_id: 'eq'
        }),
            projectAccount = m.prop([]),
            projectDetails = m.prop([]),
            acceptTerm = m.prop([true, true, true, true, true, true, true, true, true]),
            flexAcceptTerm = m.prop([true, true, true, true, true, true, true, true, true]),
            showNextTerm = function showNextTerm(index, acceptTerms) {
            var terms = acceptTerms();
            if (terms[index]) {
                terms[index] = false;
                acceptTerms(terms);
                var nextTerm = document.getElementsByClassName('w-hidden publish-rules');
                if (nextTerm[0] !== undefined) {
                    nextTerm[0].classList.remove('w-hidden');
                }
            }
            // show publish button after accepting all rules
            if (index === terms.length - 1) {
                document.getElementsByClassName('publish-btn-section')[0].classList.remove('w-hidden');
            }
        },
            loader = postgrest$1.loaderWithToken;

        filtersVM.project_id(args.root.getAttribute('data-id'));

        var l = loader(models.projectDetail.getRowOptions(filtersVM.parameters())),
            accountL = loader(models.projectAccount.getRowOptions(filtersVM.parameters()));
        l.load().then(projectDetails);
        accountL.load().then(projectAccount);

        var expiresAt = function expiresAt() {
            var project = _$1.first(projectDetails());
            return moment().add(project.online_days, 'days');
        };

        return {
            l: l,
            accountL: accountL,
            expiresAt: expiresAt,
            filtersVM: filtersVM,
            acceptTerm: acceptTerm,
            flexAcceptTerm: flexAcceptTerm,
            showNextTerm: showNextTerm,
            projectAccount: projectAccount,
            projectDetails: projectDetails
        };
    },
    view: function view(ctrl, args) {
        var project = _$1.first(ctrl.projectDetails()),
            account = _$1.first(ctrl.projectAccount()),
            flexTerms = function flexTerms(project) {
            return [m('.w-col.w-col-11', [m('div', [m('span.fontsize-smallest.fontcolor-secondary', '1/9'), ' ', m('span.fontweight-semibold', 'What can and can not change on the campaign page after publication?')]), m('div', [m('span.fontweight-semibold', 'You can not change'), ': The name of the person responsible for the campaign, the financing method, the title of the campaign, the URL of the campaign, the category of the campaign, the collection goal, the deadline, and the rewards that has supporters.', m('br'), m('br'), m('span.fontweight-semibold', 'You can change'), ': The main video of the campaign, the content of the description, the campaign image, the rewards where there are no supports made, in addition to adding new rewards during the collection'])]), m('.w-col.w-col-11', [m('div', [m('span.fontsize-smallest.fontcolor-secondary', '2/9'), ' ', m('span.fontweight-semibold', 'FLEX Rules')]), m('div', 'You have chosen the flexible campaign. In this way, you will receive all the funds collected from the supporters at the end of the campaign deadline (discounting the Grasruts fee) and must comply with the execution of the campaign and with the delivery of the rewards offered regardless of how much you collect.')]), m('.w-col.w-col-11', [m('div', [m('span.fontsize-smallest.fontcolor-secondary', '3/9'), ' ', m('span.fontweight-semibold', 'Goal of collection')]), m('div', 'The goal can not be changed after the campaign has been published.')]), m('.w-col.w-col-11', [m('div', [m('span.fontsize-smallest.fontcolor-secondary', '4/9'), ' ', m('span.fontweight-semibold', 'Rates')]), m('div', ['At the end of the campaign, we will charge 5% ', m('span.fontweight-semibold', 'Total amount collected.')])]), m('.w-col.w-col-11', [m('div', [m('span.fontsize-smallest.fontcolor-secondary', '5/9'), ' ', m('span.fontweight-semibold', 'Campaign deadline')]), m('div', 'Once set, the closing period can not be changed. If you started the campaign with the deadline, you should set it during the campaign, and you can leave the campaign open for a maximum of 12 months.')]), m('.w-col.w-col-11', [m('div', [m('span.fontsize-smallest.fontcolor-secondary', '6/9'), ' ', m('span.fontweight-semibold', 'Deadline for transfer')]), m('div', m.trust('When the deadline for your project comes to an end, you should verify your bank details. Upon confirmation, Grasruts will deposit into your checking account within 10 business days. The amount deposited will already be considering the 5% discount of the fee.'))]), m('.w-col.w-col-11', [m('div', [m('span.fontsize-smallest.fontcolor-secondary', '7/9'), ' ', m('span.fontweight-semibold', 'Responsibility of Grasruts')]), [m('div', [m('span.fontweight-semibold'), m('span.fontweight-semibold', 'Grasruts is responsible:'), ' The technological development of the platform, attendance of doubts and problems (both of supporters and directors), for hosting the campaign in the platform and for guaranteeing the security of the financial transactions.\ ', m('br'), m('br'), m('span.fontweight-semibold', 'Grasruts is not responsible:'), ' Financing, disclosure and execution, nor for the delivery of rewards of the registered campaigns.'])]]), m('.w-col.w-col-11', [m('div', [m('span.fontsize-smallest.fontcolor-secondary', '8/9'), ' ', m('span.fontweight-semibold', 'Your responsibilities')]), m('div', 'It is your responsibility to receive the money from the campaign and everything related to formatting the campaign, planning and publicizing the fundraising campaign, mobilizing supporters, executing the campaign, communicating with supporters, and producing and delivering rewards within the estimated time frame.')]), m('.w-col.w-col-11', [m('div', [m('span.fontsize-smallest.fontcolor-secondary', '9/9'), ' ', m('span', { style: { 'font-weight': ' 600' } }, 'Withdrawals from published campaign')]), m('div', [m('span.fontweight-semibold'), 'Grasruts reserves the right, in its sole discretion and once notified, to cancel campaigns and terminate the accounts of CAMPAIGN CREATORS that violate our', m('a.alt-link[href=\'http://suporte.catarse.me/hc/pt-br/articles/202387638-Diretrizes-para-cria%C3%A7%C3%A3o-de-projetos\'][target=\'_blank\']', 'Rules'), ' e ', m('a.alt-link[href=\'http://www.grasruts.com/terms-of-use\'][target=\'_blank\']', 'Terms of use'), '.'])])];
        },
            terms = function terms(project) {
            return [m('.w-col.w-col-11', [m('div', [m('span.fontsize-smallest.fontcolor-secondary', '1/9'), ' ', m('span', { style: { 'font-weight': ' 600' } }, 'What can and can not change on the campaign page after publication?')]), m('div', [m('span.fontweight-semibold', 'You can not change'), ': The name of the person in charge of the campaign, the funding mode, campaign title, campaign URL, campaign category, collection goal, chosen deadline and rewards that has supporters. ', m('br'), m('br'), m('span.fontweight-semibold', 'You can change'), ': The main video of the campaign, the content of the description, the campaign image, the rewards where there are no supports made, in addition to adding new rewards during the collection'])]), m('.w-col.w-col-11', [m('div', [m('span.fontsize-smallest.fontcolor-secondary', '2/9'), ' ', m('span.fontweight-semibold', 'All or Nothing (AON) rules')]), m('div', ['You chose the AON campaign. In this mode, you will only receive the funds collected ', m('span.fontweight-semibold', 'if it reaches or exceeds the collection goal'), '. Otherwise, all of your supporters will be refunded. You will be responsible for delivering the rewards offered if your campaign reaches the collection goal.'])]), m('.w-col.w-col-11', [m('div', [m('span.fontsize-smallest.fontcolor-secondary', '3/9'), ' ', m('span', { style: { 'font-weight': ' 600' } }, 'Goal of collection')]), m('div', 'The goal can not be changed after the campaign has been published.')]), m('.w-col.w-col-11', [m('div', [m('span.fontsize-smallest.fontcolor-secondary', '4/9'), ' ', m('span', { style: { 'font-weight': ' 600' } }, 'Rates')]), m('div', ['We charge 5% of total amount collected for your campaign if it reaches or exceeds the target within the campaign deadline. If the campaign does not reach the goal, no fee will be charged.', m('span.fontweight-semibold')])]), m('.w-col.w-col-11', [m('div', [m('span.fontsize-smallest.fontcolor-secondary', '5/9'), ' ', m('span', { style: { 'font-weight': ' 600' } }, 'Campaign deadline')]), m('div', 'Your campaign will be in collection in Grasruts until the day ' + h.momentify(ctrl.expiresAt()) + ' at 23h59min59s.This deadline can not be changed after the campaign has been published.')]), m('.w-col.w-col-11', [m('div', [m('span.fontsize-smallest.fontcolor-secondary', '6/9'), ' ', m('span', { style: { 'font-weight': ' 600' } }, 'Transfer and refund rules'), m('div', [m.trust('When the deadline for your campaign comes to an end, you should verify your bank details. After this confirmation, Grasruts will deposit the amount collected with discounting the Grasruts fee, into your account in 10 business days. If the project does not reach 100% of the target by the deadline, then Grasruts will reimburse the supporters.')])]), m('div', '')]), m('.w-col.w-col-11', [m('div', [m('span.fontsize-smallest.fontcolor-secondary', '7/9'), ' ', m('span', { style: { 'font-weight': ' 600' } }, 'Responsibility of Grasruts')]), [m('div', [m('span.fontweight-semibold'), m('span.fontweight-semibold', 'Grasruts is responsible:'), ' The technological development of the platform, attendance of doubts and problems (both of supporters and directors), for hosting the campaign on the platform and for ensuring the security of financial transactions.\ ', m('br'), m('br'), m('span.fontweight-semibold', 'Grasruts is not responsible:'), ' Financing, dissemination and execution, nor for the delivery of rewards of the campaign registered.'])]]), m('.w-col.w-col-11', [m('div', [m('span.fontsize-smallest.fontcolor-secondary', '8/9'), ' ', m('span', { style: { 'font-weight': ' 600' } }, 'Your responsibilities')]), m('div', 'It is your responsibility to receive the money from the campaign and everything related to formatting the campaign, planning and publicizing the fundraising campaign, mobilizing supporters, executing the campaign, communicating with supporters, and producing and delivering rewards within the estimated time frame.')]), m('.w-col.w-col-11', [m('div', [m('span.fontsize-smallest.fontcolor-secondary', '9/9'), ' ', m('span', { style: { 'font-weight': ' 600' } }, 'Withdrawals from published campaign')]), m('div', [m('span.fontweight-semibold'), 'Grasruts reserves the right, in its sole discretion and once notified, to cancel campaign and terminate the accounts of CAMPAIGN CREATORS that violate our', m('a.alt-link[href=\'http://suporte.catarse.me/hc/pt-br/articles/202387638-Diretrizes-para-cria%C3%A7%C3%A3o-de-projetos\'][target=\'_blank\']', 'Rules'), ' and ', m('a.alt-link[href=\'http://www.grasruts.com/terms-of-use\'][target=\'_blank\']', 'Terms of use'), '.'])])];
        };

        return [project && account ? [project.is_owner_or_admin ? m.component(projectDashboardMenu, {
            project: m.prop(project),
            hidePublish: true
        }) : '', m('.w-section.section-product.' + project.mode), m('.w-section.section', [m('.w-container', [m('.w-row', [m('.w-col.w-col-3'), m('.w-col.w-col-6', [m('.u-text-center', [m('img.u-marginbottom-20[src=\'/assets/catarse_bootstrap/launch-icon.png\'][width=\'94\']'), m('.fontsize-large.fontweight-semibold.u-marginbottom-20', 'Ready to launch your campaign?'), m('.fontsize-base.u-marginbottom-30', 'We have prepared a list with important information for you to check before putting your campaign online!')])]), m('.w-col.w-col-3')])])]), m('.divider'), m('.w-section.section-one-column.bg-gray.section.before-footer', [m('.w-container', [m('.card.medium.u-marginbottom-60.card-terciary', [m('.w-row', [m('.w-col.w-col-6.w-clearfix', [m('img.card-project-thumb.u-right[src=' + project.large_image + ']')]), m('.w-col.w-col-6', [m('.u-marginbottom-30.fontsize-base', [m('div', [m('span.fontweight-semibold', 'Title: '), project.name]), m('div', [m('span.fontweight-semibold', 'Link: '), 'www.grasruts.com/' + project.permalink]), m('div', [m('span.fontweight-semibold', 'Type: '), I18n$1.t(project.mode, I18nScope$44())]), m('div', [m('span.fontweight-semibold', 'Goal: '), 'Rs ' + h.formatNumber(project.goal, 2, 3)]), project.online_days !== null ? m('div', [m('span.fontweight-semibold', 'Deadline: ' + project.online_days + ' ' + (project.online_days > 1 ? 'days' : 'day'))]) : ''
        // m('div', [m('span.fontweight-semibold', 'Responsável: '), account.owner_name])
        // m('div', [m('span.fontweight-semibold', 'CPF/CNPJ: '), account.owner_document])
        ])])]), m('.u-text-center', [m('.w-row', [m('.w-col.w-col-1'), m('.w-col.w-col-10', [m('.divider.u-marginbottom-10'), m('.fontsize-small.fontcolor-secondary', 'The above data can not be changed after the campaign goes online. If you need to make changes, navigate the sidebar and come back here when you are done!')]), m('.w-col.w-col-1')])])]), m('.card.medium.u-radius.u-marginbottom-60', [m('.u-text-center.u-marginbottom-60', [m('.fontsize-large.fontweight-semibold', 'Remember our rules'), m('.w-row', [m('.w-col.w-col-2'), m('.w-col.w-col-8', [m('.fontsize-small', ['Before posting, click on the circles below and confirm that you are aware of how Grasruts works.'])]), m('.w-col.w-col-2')])]), _$1.map(project.mode === 'flex' ? flexTerms(project) : terms(project), function (term, index) {
            return m('.u-marginbottom-30.fontsize-base' + (index === 0 ? '' : '.w-hidden.publish-rules'), [m('.w-row[id=\'rule-' + index + '\']', [m('.w-col.w-col-1.u-text-center', [m('div', [m((project.mode === 'flex' ? ctrl.flexAcceptTerm() : ctrl.acceptTerm())[index] ? 'a.w-inline-block.checkbox-big[href=\'#rule-' + (index + 1) + '\']' : 'a.w-inline-block.checkbox-big.checkbox--selected.fa.fa-check.fa-lg[href=\'#rule-' + (index + 1) + '\']', { onclick: function onclick() {
                    return ctrl.showNextTerm(index, project.mode === 'flex' ? ctrl.flexAcceptTerm : ctrl.acceptTerm);
                } })])]), term])]);
        })]), m('.w-row.publish-btn-section.w-hidden', [m('.w-col.w-col-4'), m('.w-col.w-col-4', [m('a.btn.btn-large.u-marginbottom-20[href=/' + (project.mode === 'flex' ? 'flexible_projects' : 'projects') + '/' + project.project_id + '/push_to_online]', 'Publish Now!'), m('.u-text-center.fontsize-smaller', ['When you publish your campaign, you are accepting ', m('a.alt-link[href=\'/terms-of-use\'][target=\'_blank\']', 'Terms of use'), ' and ', m('a.alt-link[href=\'/privacy-policy\'][target=\'_blank\']', 'Privacy Policy')])]), m('.w-col.w-col-4')])])]), '\
    '] : h.loader()];
    }
};

var startVM = function startVM(I18n) {
    var i18nStart = I18n.translations[I18n.currentLocale()].pages.start,

    // testimonials = i18nStart.testimonials,
    categoryProjects = i18nStart.categoryProjects,
        panes = i18nStart.panes,
        qa = i18nStart.qa;

    return {
        // testimonials: _.map(testimonials, testimonial => ({
        //     thumbUrl: testimonial.thumb,
        //     content: testimonial.content,
        //     name: testimonial.name,
        //     totals: testimonial.totals
        // })),
        panes: _$1.map(panes, function (pane) {
            return {
                label: pane.label,
                src: pane.src
            };
        }),
        questions: {
            col_1: _$1.map(qa.col_1, function (question) {
                return {
                    question: question.question,
                    answer: question.answer
                };
            }),
            col_2: _$1.map(qa.col_2, function (question) {
                return {
                    question: question.question,
                    answer: question.answer
                };
            })
        },
        categoryProjects: _$1.map(categoryProjects, function (category) {
            return {
                categoryId: category.category_id,
                sampleProjects: [category.sample_project_ids.primary, category.sample_project_ids.secondary]
            };
        })
    };
};

// import youtubeLightbox from '../c/youtube-lightbox';
// import slider from '../c/slider';
var I18nScope$45 = _$1.partial(h.i18nScope, 'pages.start');

var start = {
    controller: function controller() {
        h.analytics.windowScroll({ cat: 'project_start', act: 'start_page_scroll' });
        var stats = m.prop([]),
            categories = m.prop([]),
            selectedPane = m.prop(0),
            selectedCategory = m.prop([]),
            featuredProjects = m.prop([]),
            selectedCategoryIdx = m.prop(-1),
            startvm = startVM(I18n$1),
            filters = postgrest$1.filtersVM,
            paneImages = startvm.panes,
            categoryvm = filters({
            category_id: 'eq'
        }),
            projectvm = filters({
            project_id: 'eq'
        }),
            uservm = filters({
            id: 'eq'
        }),
            loader = postgrest$1.loader,
            statsLoader = loader(models.statistic.getRowOptions()),
            loadCategories = function loadCategories() {
            return models.category.getPage(filters({}).order({
                name: 'asc'
            }).parameters()).then(categories);
        },
            selectPane = function selectPane(idx) {
            return function () {
                selectedPane(idx);
            };
        },
            lCategory = function lCategory() {
            return loader(models.categoryTotals.getRowOptions(categoryvm.parameters()));
        },
            lProject = function lProject() {
            return loader(models.projectDetail.getRowOptions(projectvm.parameters()));
        },
            lUser = function lUser() {
            return loader(models.userDetail.getRowOptions(uservm.parameters()));
        },
            linkToExternal = function linkToExternal(category) {
            var externalLinkCategories = I18n$1.translations[I18n$1.currentLocale()].projects.index.explore_categories;
            return _$1.isUndefined(externalLinkCategories[category.id]) ? null : externalLinkCategories[category.id].link + '?ref=ctrse_start';
        },
            loadCategoryProjects = function loadCategoryProjects(category) {
            selectedCategory(category);
            var categoryProjects = _$1.findWhere(startvm.categoryProjects, {
                categoryId: _$1.first(category).category_id
            });
            featuredProjects([]);
            if (!_$1.isUndefined(categoryProjects)) {
                _$1.map(categoryProjects.sampleProjects, function (project_id, idx) {
                    if (!_$1.isUndefined(project_id)) {
                        projectvm.project_id(project_id);
                        lProject().load().then(function (project) {
                            return setProject(project, idx);
                        });
                    }
                });
            }
        },
            selectCategory = function selectCategory(category) {
            return function () {
                var externalLink = linkToExternal(category);
                if (externalLink) {
                    window.location = externalLink;
                    return;
                }
                selectedCategoryIdx(category.id);
                categoryvm.category_id(category.id);
                selectedCategory([category]);
                m.redraw();
                lCategory().load().then(loadCategoryProjects);
            };
        },
            setUser = function setUser(user, idx) {
            featuredProjects()[idx] = _$1.extend({}, featuredProjects()[idx], {
                userThumb: _$1.first(user).profile_img_thumbnail
            });
        },
            setProject = function setProject(project, idx) {
            featuredProjects()[idx] = _$1.first(project);
            uservm.id(_$1.first(project).user.id);
            lUser().load().then(function (user) {
                return setUser(user, idx);
            });
        },
            projectCategory = m.prop('-1'),
            projectName = m.prop(''),
            projectNameError = m.prop(false),
            projectCategoryError = m.prop(false),
            validateProjectForm = function validateProjectForm() {
            projectCategoryError(projectCategory() == -1);
            projectNameError(projectName().trim() === '');

            return !projectCategoryError() && !projectNameError();
        };

        statsLoader.load().then(stats);
        loadCategories();
        return {
            stats: stats,
            categories: categories,
            paneImages: paneImages,
            selectCategory: selectCategory,
            selectedCategory: selectedCategory,
            selectedCategoryIdx: selectedCategoryIdx,
            selectPane: selectPane,
            selectedPane: selectedPane,
            featuredProjects: featuredProjects,
            linkToExternal: linkToExternal,
            testimonials: startvm.testimonials,
            questions: startvm.questions,
            projectCategory: projectCategory,
            projectName: projectName,
            projectNameError: projectNameError,
            projectCategoryError: projectCategoryError,
            validateProjectForm: validateProjectForm
        };
    },
    view: function view(ctrl, args) {
        var stats = _$1.first(ctrl.stats());
        var testimonials = function testimonials() {
            return _$1.map(ctrl.testimonials, function (testimonial) {
                var content = m('.card.u-radius.card-big.card-terciary', [m('.u-text-center.u-marginbottom-20', [m('img.thumb-testimonial.u-round.u-marginbottom-20[src="' + testimonial.thumbUrl + '"]')]), m('p.fontsize-large.u-marginbottom-30', '"' + testimonial.content + '"'), m('.u-text-center', [m('.fontsize-large.fontweight-semibold', testimonial.name), m('.fontsize-base', testimonial.totals)])]);

                return {
                    content: content
                };
            });
        };

        return m('#start', { config: h.setPageTitle(I18n$1.t('header_html', I18nScope$45())) }, [m('.w-section.hero-full.hero-start', [m('.w-container.u-text-center', [m('.fontsize-megajumbo.fontweight-semibold.u-marginbottom-40', I18n$1.t('slogan', I18nScope$45())), m('.w-row.u-marginbottom-40', [m('.w-col.w-col-4.w-col-push-4', [m('a.btn.btn-large.u-marginbottom-10[href="#start-form"]', {
            config: h.scrollTo(),
            onclick: h.analytics.event({ cat: 'project_start', act: 'start_btnstart_click' })
        }, I18n$1.t('submit', I18nScope$45()))])]), m('.w-row', _$1.isEmpty(stats) ? '' : [m('.w-col.w-col-4', [m('.fontsize-largest.lineheight-loose', h.formatNumber(stats.total_contributors, 0, 3)), m('p.fontsize-small.start-stats', I18n$1.t('header.people', I18nScope$45()))]), m('.w-col.w-col-4', [m('.fontsize-largest.lineheight-loose', 'Rs ' + stats.total_contributed.toString()), m('p.fontsize-small.start-stats', I18n$1.t('header.money', I18nScope$45()))]), m('.w-col.w-col-4', [m('.fontsize-largest.lineheight-loose', h.formatNumber(stats.total_projects_success, 0, 3)), m('p.fontsize-small.start-stats', I18n$1.t('header.success', I18nScope$45()))])])])]), m('.w-section.section', [m('.w-container', [m('.w-row', [m('.w-col.w-col-10.w-col-push-1.u-text-center', [m('.fontsize-larger.u-marginbottom-10.fontweight-semibold', I18n$1.t('page-title', I18nScope$45())), m('.fontsize-small', I18n$1.t('page-subtitle', I18nScope$45()))])]), m('.w-clearfix.how-row', [m('.w-hidden-small.w-hidden-tiny.how-col-01', [m('.info-howworks-backers', [m('.fontweight-semibold.fontsize-large', I18n$1.t('banner.1', I18nScope$45())), m('.fontsize-base', I18n$1.t('banner.2', I18nScope$45()))]), m('.info-howworks-backers', [m('.fontweight-semibold.fontsize-large', I18n$1.t('banner.3', I18nScope$45())), m('.fontsize-base', I18n$1.t('banner.4', I18nScope$45()))])]), m('.how-col-02'), m('.how-col-03', [m('.fontweight-semibold.fontsize-large', I18n$1.t('banner.5', I18nScope$45())), m('.fontsize-base', I18n$1.t('banner.6', I18nScope$45())), m('.fontweight-semibold.fontsize-large.u-margintop-30', I18n$1.t('banner.7', I18nScope$45())), m('.fontsize-base', I18n$1.t('banner.8', I18nScope$45()))]), m('.w-hidden-main.w-hidden-medium.how-col-01', [m('.info-howworks-backers', [m('.fontweight-semibold.fontsize-large', I18n$1.t('banner.1', I18nScope$45())), m('.fontsize-base', I18n$1.t('banner.2', I18nScope$45()))]), m('.info-howworks-backers', [m('.fontweight-semibold.fontsize-large', I18n$1.t('banner.3', I18nScope$45())), m('.fontsize-base', I18n$1.t('banner.4', I18nScope$45()))])])])])]), m('.w-section.divider'),
        // m('.w-section.section-large', [
        //     m('.w-container.u-text-center.u-marginbottom-60', [
        //         m('div', [
        //             m('span.fontsize-largest.fontweight-semibold', I18n.t('features.title', I18nScope()))
        //         ]),
        //         m('.w-hidden-small.w-hidden-tiny.fontsize-large.u-marginbottom-20', I18n.t('features.subtitle', I18nScope())),
        //         m('.w-hidden-main.w-hidden-medium.u-margintop-30', [
        //             m('.fontsize-large.u-marginbottom-30', I18n.t('features.feature_1', I18nScope())),
        //             m('.fontsize-large.u-marginbottom-30', I18n.t('features.feature_2', I18nScope())),
        //             m('.fontsize-large.u-marginbottom-30', I18n.t('features.feature_3', I18nScope())),
        //             m('.fontsize-large.u-marginbottom-30', I18n.t('features.feature_4', I18nScope())),
        //             m('.fontsize-large.u-marginbottom-30', I18n.t('features.feature_5', I18nScope())),
        //             m('.fontsize-large.u-marginbottom-30', I18n.t('features.feature_6', I18nScope()))
        //         ])
        //     ]),
        //     m('.w-container', [
        //         m('.w-tabs.w-hidden-small.w-hidden-tiny', [
        //             m('.w-tab-menu.w-col.w-col-4', _.map(ctrl.paneImages, (pane, idx) => m(`btn.w-tab-link.w-inline-block.tab-list-item${(idx === ctrl.selectedPane()) ? '.selected' : ''}`, {
        //                 onclick: h.analytics.event({ cat: 'project_start', act: 'start_solution_click', lbl: pane.label }, ctrl.selectPane(idx))
        //             }, pane.label))),
        //             m('.w-tab-content.w-col.w-col-8', _.map(ctrl.paneImages, (pane, idx) => m('.w-tab-pane', [
        //                 m(`img[src="${pane.src}"].pane-image${(idx === ctrl.selectedPane()) ? '.selected' : ''}`)
        //             ])))
        //         ])
        //     ])
        // ]),

        m('.w-section.section-large.card-terciary', m('.w-container', [m('.u-text-center.u-marginbottom-40', [m('div', m('span.fontsize-largest.fontweight-semibold', I18n$1.t('mode.title', I18nScope$45()))), m('.w-row', [m('.w-col.w-col-1'), m('.w-col.w-col-10', m('.fontsize-large.u-marginbottom-20', I18n$1.t('mode.subtitle', I18nScope$45()))), m('.w-col.w-col-1')])]), m('div', m('.flex-row.u-marginbottom-40', [m('.flex-column.card.u-radius.u-marginbottom-30', [m('.u-text-center.u-marginbottom-30', m('img[src=\'/assets/aon-badge.png\']')), m('.fontsize-large.flex-column.u-marginbottom-20', [I18n$1.t('mode.aon.info', I18nScope$45()), m.trust('&nbsp;')]), m('.fontsize-base.flex-column.fontcolor-secondary', I18n$1.t('mode.aon.info_2', I18nScope$45()))]), m('.flex-column.card.u-radius.u-marginbottom-30', [m('.u-text-center.u-marginbottom-30', m('img[src=\'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/5632ebacd092957f34eaea9c_badge-flex.png\']')), m('.fontsize-large.flex-column.u-marginbottom-20', I18n$1.t('mode.flex.info', I18nScope$45())), m('.fontsize-base.flex-column.fontcolor-secondary', I18n$1.t('mode.flex.info_2', I18nScope$45()))])])), m('.u-text-center.u-marginbottom-30', [m('.fontsize-large.fontweight-semibold', I18n$1.t('mode.tax_info', I18nScope$45()))])])),

        // m('.w-section.section-large.bg-blue-one', [
        //     m('.w-container.u-text-center', [
        //         m('.fontsize-larger.lineheight-tight.fontcolor-negative.u-marginbottom-20', [
        //             I18n.t('video.title', I18nScope()),
        //             m('br'),
        //             I18n.t('video.subtitle', I18nScope())
        //         ]),
        //         m.component(youtubeLightbox, {
        //             src: I18n.t('video.src', I18nScope()),
        //             onclick: h.analytics.event({ cat: 'project_start', act: 'start_video_play' })
        //         })
        //     ])
        // ]),
        // m('.w-hidden-small.w-hidden-tiny.section-categories', [
        //     m('.w-container', [
        //         m('.u-text-center', [
        //             m('.w-row', [
        //                 m('.w-col.w-col-10.w-col-push-1', [
        //                     m('.fontsize-large.u-marginbottom-40.fontcolor-negative', I18n.t('categories.title', I18nScope()))
        //                 ])
        //             ])
        //         ]),
        //         m('.w-tabs', [
        //             m('.w-tab-menu.u-text-center', _.map(ctrl.categories(), category => m(`a.w-tab-link.w-inline-block.btn-category.small.btn-inline${(ctrl.selectedCategoryIdx() === category.id) ? '.w--current' : ''}`, {
        //                 onclick: h.analytics.event({ cat: 'project_start', act: 'start_category_click', lbl: category.name }, ctrl.selectCategory(category))
        //             }, [
        //                 m('div', category.name)
        //             ]))),
        //             m('.w-tab-content.u-margintop-40', [
        //                 m('.w-tab-pane.w--tab-active', [
        //                     m('.w-row', (ctrl.selectedCategoryIdx() !== -1) ? _.map(ctrl.selectedCategory(), category => [
        //                         m('.w-col.w-col-5', [
        //                             m('.fontsize-jumbo.u-marginbottom-20', category.name),
        //                             m('a.w-button.btn.btn-medium.btn-inline.btn-dark[href="#start-form"]', {
        //                                 config: h.scrollTo()
        //                             }, I18n.t('submit', I18nScope()))
        //                         ]),
        //                         m('.w-col.w-col-7', [
        //                             m('.fontsize-megajumbo.fontcolor-negative', `R$ ${category.total_successful_value ? h.formatNumber(category.total_successful_value, 2, 3) : '...'}`),
        //                             m('.fontsize-large.u-marginbottom-20', 'Doados para projetos'),
        //                             m('.fontsize-megajumbo.fontcolor-negative', (category.successful_projects) ? category.successful_projects : '...'),
        //                             m('.fontsize-large.u-marginbottom-30', 'Projetos financiados'),
        //                             !_.isEmpty(ctrl.featuredProjects()) ? _.map(ctrl.featuredProjects(), project => !_.isUndefined(project) ? m('.w-row.u-marginbottom-10', [
        //                                 m('.w-col.w-col-1', [
        //                                     m(`img.user-avatar[src="${h.useAvatarOrDefault(project.userThumb)}"]`)
        //                                 ]),
        //                                 m('.w-col.w-col-11', [
        //                                     m('.fontsize-base.fontweight-semibold', project.user.name),
        //                                     m('.fontsize-smallest', [
        //                                         I18n.t('categories.pledged', I18nScope({ pledged: h.formatNumber(project.pledged), contributors: project.total_contributors })),
        //                                         m(`a.link-hidden[href="/${project.permalink}"]`, project.name)
        //                                     ])
        //                                 ])
        //                             ]) : m('.fontsize-base', I18n.t('categories.loading_featured', I18nScope()))) : '',
        //                         ])
        //                     ]) : '')
        //                 ])
        //             ])
        //         ])
        //     ])
        // ]),
        // m.component(slider, {
        //     slides: testimonials(),
        //     title: I18n.t('testimonials_title', I18nScope()),
        //     slideClass: 'slide-testimonials-content',
        //     wrapperClass: 'slide-testimonials',
        //     onchange: h.analytics.event({ cat: 'project_start', act: 'start_testimonials_change' })
        // }),
        // m('.w-section.divider.u-margintop-30'),
        m('.w-container', [m('.fontsize-larger.u-text-center.u-marginbottom-60.u-margintop-40', I18n$1.t('qa_title', I18nScope$45())), m('.w-row.u-marginbottom-60', [m('.w-col.w-col-6', _$1.map(ctrl.questions.col_1, function (question) {
            return m.component(landingQA, {
                question: question.question,
                answer: question.answer,
                onclick: h.analytics.event({ cat: 'project_start', act: 'start_qa_click', lbl: question.question })
            });
        })), m('.w-col.w-col-6', _$1.map(ctrl.questions.col_2, function (question) {
            return m.component(landingQA, {
                question: question.question,
                answer: question.answer,
                onclick: h.analytics.event({ cat: 'project_start', act: 'start_qa_click', lbl: question.question })
            });
        }))])]), m('#start-form.w-section.section-large.u-text-center.bg-purple.before-footer', [m('.w-container', [m('.fontsize-jumbo.fontcolor-negative.u-marginbottom-60', 'Create your campaign for FREE!'), m('form[action="/projects/fallback_create"][method="GET"].w-row.w-form', {
            onsubmit: function onsubmit(e) {
                h.analytics.oneTimeEvent({ cat: 'project_create', act: 'create_form_submit' })(e);
                return ctrl.validateProjectForm();
            }
        }, [m('.w-col.w-col-2'), m('.w-col.w-col-8', [m('.fontsize-larger.fontcolor-negative.u-marginbottom-10', I18n$1.t('form.title', I18nScope$45())), m('input[name="utf8"][type="hidden"][value="✓"]'), m('input[name="authenticity_token"][type="hidden"][value="' + h.authenticityToken() + '"]'), m('input.w-input.text-field.medium.u-marginbottom-30[type="text"]', {
            name: 'project[name]',
            class: ctrl.projectNameError() ? 'error' : '',
            onfocus: function onfocus() {
                return ctrl.projectNameError(false);
            },
            onchange: function onchange(e) {
                h.analytics.oneTimeEvent({ cat: 'project_create', act: 'create_form_change', lbl: 'name' })(e);
                m.withAttr('value', ctrl.projectName)(e);
            }
        }), m('.fontsize-larger.fontcolor-negative.u-marginbottom-10', 'in category'), m('select.w-select.text-field.medium.u-marginbottom-40', {
            name: 'project[category_id]',
            class: ctrl.projectCategoryError() ? 'error' : '',
            onfocus: function onfocus() {
                return ctrl.projectCategoryError(false);
            },
            onchange: function onchange(e) {
                h.analytics.oneTimeEvent({ cat: 'project_create', act: 'create_form_change', lbl: 'category' })(e);
                m.withAttr('value', ctrl.projectCategory)(e);
            }
        }, [m('option[value="-1"]', I18n$1.t('form.select_default', I18nScope$45())), _$1.map(ctrl.categories(), function (category) {
            return m('option[value="' + category.id + '"]', { selected: ctrl.projectCategory() === category.id }, category.name);
        })])]), m('.w-col.w-col-2'), m('.w-row.u-marginbottom-20', [m('.w-col.w-col-4.w-col-push-4.u-margintop-40', [m('input[type="submit"][value="' + I18n$1.t('form.submit', I18nScope$45()) + '"].w-button.btn.btn-large')])]), m('.w-row.u-marginbottom-80', ctrl.projectNameError() || ctrl.projectCategoryError() ? m.component(inlineError, { message: 'Please check the fields above again!' }) : '')])])])]);
    }
};

var teamTotal = {
    controller: function controller() {
        var vm = {
            collection: m.prop([])
        };

        models.teamTotal.getRow().then(function (data) {
            vm.collection(data);
        });

        return {
            vm: vm
        };
    },
    view: function view(ctrl, args) {
        return m('#team-total-static.w-section.section-one-column.section.u-margintop-40.u-text-center.u-marginbottom-20', [ctrl.vm.collection().map(function (teamTotal) {
            return m('.w-container', [m('.w-row', [m('.w-col.w-col-2'), m('.w-col.w-col-8', [m('.fontsize-base.u-marginbottom-30',
            // `Today we are ${teamTotal.member_count} people scattered over ${teamTotal.total_cities} cities in ${teamTotal.countries.length} countries (${teamTotal.countries.toString()})! Grasruts is independent, open-source, and built with love. Our passion is to build an environment where more and more projects can come to life.`
            'Today we are ' + teamTotal.member_count + ' member startup.Grasruts is independent, open-source, and built with love. Our passion is to build an environment where more and more campaigns can come to life.'), m('.fontsize-larger.lineheight-tight.text-success', 'Our team, together, has already contributed Rs ' + h.formatNumber(teamTotal.total_amount) + ' for ' + teamTotal.total_contributed_projects + ' campaigns!')]), m('.w-col.w-col-2')])]);
        })]);
    }
};

var teamMembers = {
    controller: function controller() {
        var vm = {
            collection: m.prop([])
        },
            groupCollection = function groupCollection(collection, groupTotal) {
            return _$1.map(_$1.range(Math.ceil(collection.length / groupTotal)), function (i) {
                return collection.slice(i * groupTotal, (i + 1) * groupTotal);
            });
        };

        models.teamMember.getPage().then(function (data) {
            vm.collection(groupCollection(data, 4));
        });

        return {
            vm: vm
        };
    },
    view: function view(ctrl) {
        return m('#team-members-static.w-section.section', [m('.w-container', [_$1.map(ctrl.vm.collection(), function (group) {
            return m('.w-row.u-text-center', [_$1.map(group, function (member) {
                return m('.team-member.w-col.w-col-3.w-col-small-3.w-col-tiny-6.u-marginbottom-40', [m('a.alt-link[href="/users/' + member.id + '"]', [m('img.thumb.big.u-round.u-marginbottom-10[src="' + member.img + '"]'), m('.fontweight-semibold.fontsize-base', member.name)]), m('.fontsize-smallest.fontcolor-secondary', 'Supported ' + member.total_contributed_projects + ' campaigns')]);
            })]);
        })])]);
    }
};

var team = {
    view: function view() {
        return m('#static-team-app', [m('.w-section.hero-who.hero-full', [m('.w-container.u-text-center', [m('img.icon-hero[src="/assets/logo-yellow.png"]'), m('.u-text-center.u-marginbottom-20.fontsize-largest', 'Meet Our Team')])]), m.component(teamTotal), m.component(teamMembers)]);
    }
};

var I18nScope$47 = _.partial(h.i18nScope, 'layouts');

var menuSearch = {
    view: function view(ctrl, args) {
        return m('span#menu-search', [m('.w-form.w-hidden-small.w-hidden-tiny.header-search[id=\'discover-form-wrapper\']', [m('form.discover-form[accept-charset=\'UTF-8\'][action=\'/en/explore?ref=ctrse_header\'][id=\'search-form\'][method=\'get\']', [m('div', { style: { display: 'none' } }, m('input[name=\'utf8\'][type=\'hidden\'][value=\'✓\']')), m('input.w-input.text-field.prefix.search-input[autocomplete=\'off\'][id=\'pg_search\'][name=\'pg_search\'][placeholder=\'Search for campaigns\'][type=\'text\']')]), m('.search-pre-result.w-hidden[data-searchpath=\'/en/auto_complete_projects\']', [m('.result', m('.u-text-center', m('img[alt=\'Loader\'][src=\'/assets/catarse_bootstrap/loader.gif\']'))), m('a.btn.btn-small.btn-terciary.see-more-projects[href=\'javascript:void(0);\']', ' more')])]), m('a.w-inline-block.w-hidden-small.w-hidden-tiny.btn.btn-dark.btn-attached.postfix[href=\'#\'][id=\'pg_search_submit\']', m('img.header-lupa[alt=\'Magnifying glass\'][data-pin-nopin=\'true\'][src=\'/assets/catarse_bootstrap/lupa.png\']'))]);
    }
};

var I18nScope$48 = _$1.partial(h.i18nScope, 'layouts');
var menuProfile = {
    controller: function controller(args) {
        var contributedProjects = m.prop(),
            latestProjects = m.prop([]),
            userDetails = m.prop({}),
            user_id = args.user.user_id,
            userBalance = m.prop(0),
            userIdVM = postgrest.filtersVM({ user_id: 'eq' });

        var userName = function userName() {
            var name = userVM.displayName(userDetails());
            if (name && !_$1.isEmpty(name)) {
                return _$1.first(name.split(' '));
            }

            return '';
        };

        userVM.fetchUser(user_id, true, userDetails);

        userIdVM.user_id(user_id);
        models.balance.getRowWithToken(userIdVM.parameters()).then(function (result) {
            var data = _$1.first(result) || { amount: 0, user_id: user_id };
            userBalance(data.amount);
        });

        return {
            contributedProjects: contributedProjects,
            latestProjects: latestProjects,
            userDetails: userDetails,
            userName: userName,
            toggleMenu: h.toggleProp(false, true),
            userBalance: userBalance
        };
    },
    view: function view(ctrl, args) {
        var user = ctrl.userDetails();

        return m('.w-dropdown.user-profile', [m('.w-dropdown-toggle.dropdown-toggle.w-clearfix[id=\'user-menu\']', {
            onclick: ctrl.toggleMenu.toggle
        }, [m('.user-name-menu', [m('.fontsize-smaller.lineheight-tightest.text-align-right', ctrl.userName()), ctrl.userBalance() > 0 ? m('.fontsize-smallest.fontweight-semibold.text-success', 'Rs ' + h.formatNumber(ctrl.userBalance(), 2, 3)) : '']), m('img.user-avatar[alt=\'Thumbnail - ' + user.name + '\'][height=\'40\'][src=\'' + h.useAvatarOrDefault(user.profile_img_thumbnail) + '\'][width=\'40\']')]), ctrl.toggleMenu() ? m('nav.w-dropdown-list.dropdown-list.user-menu.w--open[id=\'user-menu-dropdown\']', { style: 'display:block;' }, [m('.w-row', [m('.w-col.w-col-12', [m('.fontweight-semibold.fontsize-smaller.u-marginbottom-10', 'My History'), m('ul.w-list-unstyled.u-marginbottom-20', [
        // m('li.lineheight-looser',
        //   m(`a.alt-link.fontsize-smaller[href='/en/users/${user.id}/edit#balance']`,
        //     m('span', [
        //         'Balance ',
        //         (ctrl.userBalance() > 0 ? m('span.fontcolor-secondary',
        //           `Rs ${h.formatNumber(ctrl.userBalance(), 2, 3)}`) : ''),
        //     ])
        //    )
        //  ),
        m('li.lineheight-looser', m('a.alt-link.fontsize-smaller[href=\'/en/users/' + user.id + '/edit#contributions\']', 'Support History')), m('li.lineheight-looser', m('a.alt-link.fontsize-smaller[href=\'/en/users/' + user.id + '/edit#projects\']', 'Projects Created')), m('li.w-hidden-main.w-hidden-medium.lineheight-looser', m('a.alt-link.fontsize-smaller[href=\'/en/users/' + user.id + '/edit#projects\']', 'Projects Created'))]), m('.fontweight-semibold.fontsize-smaller.u-marginbottom-10', 'Settings'), m('ul.w-list-unstyled.u-marginbottom-20', [m('li.lineheight-looser', m('a.alt-link.fontsize-smaller[href=\'/connect-facebook/\']', 'Find Friends')), m('li.lineheight-looser', m('a.alt-link.fontsize-smaller[href=\'/en/users/' + user.id + '/edit#about_me\']', 'Public Profile')),
        //                                                 m('li.lineheight-looser',
        //                                                     m(`a.alt-link.fontsize-smaller[href='/en/users/${user.id}/edit#settings']`,
        //                                                         `Dados financeiros`
        // >>>>>>> upstream/master
        //                                                     )
        //                                                 )
        m('li.lineheight-looser', m('a.alt-link.fontsize-smaller[href=\'/en/users/' + user.id + '/edit#settings\']', 'Data and address'))]), m('.divider.u-marginbottom-20'), args.user.is_admin_role ? m('.fontweight-semibold.fontsize-smaller.u-marginbottom-10', 'Admin') : '', args.user.is_admin_role ? m('ul.w-list-unstyled.u-marginbottom-20', [m('li.lineheight-looser', m('a.alt-link.fontsize-smaller[href=\'/en/new-admin#/users\']', 'Users')), m('li.lineheight-looser', m('a.alt-link.fontsize-smaller[href=\'/en/new-admin\']', 'Support')),
        // m('li.lineheight-looser',
        //   m('a.alt-link.fontsize-smaller[href=\'/en/new-admin#/balance-transfers\']',
        //     'Balance Transfer'
        //    )
        //  ),
        m('li.lineheight-looser', m('a.alt-link.fontsize-smaller[href=\'/en/admin/financials\']', 'Financial Relation')), m('li.lineheight-looser', m('a.alt-link.fontsize-smaller[href=\'/en/admin/projects\']', 'Admin projects')), m('li.lineheight-looser', m('a.alt-link.fontsize-smaller[href=\'/en/dbhero\']', 'Dataclips'))]) : '',
        // m('.fontsize-mini', 'Seu e-mail de cadastro é: '),
        // m('.fontsize-smallest.u-marginbottom-20', [
        //     m('span.fontweight-semibold', `${user.email} `),
        //     m(`a.alt-link[href='/pt/users/${user.id}/edit#about_me']`, 'alterar e-mail')
        // ]),
        // m('.divider.u-marginbottom-20'),
        m('a.alt-link[href=\'/en/logout\']', 'Logout')])])]) : '']);
    }
};

var I18nScope$46 = _$1.partial(h.i18nScope, 'layouts');

var menu = {
    controller: function controller(args) {
        var user = h.getUser(),
            menuCss = function menuCss() {
            var dynamicClasses = void 0;

            return (args.menuTransparency ? 'overlayer' : '') + ' ' + (args.withAlert || args.withFixedAlert ? 'with-global-alert' : '');
        },
            homeAttrs = function homeAttrs() {
            if (args.absoluteHome) {
                return {
                    href: h.rootUrl()
                };
            }
            return {
                config: m.route
            };
        };

        return {
            user: user,
            menuCss: menuCss,
            homeAttrs: homeAttrs
        };
    },
    view: function view(ctrl, args) {
        return m('header.main-header', {
            class: ctrl.menuCss()
        }, [m('.w-row', [m('.w-clearfix.w-col.w-col-8.w-col-small-8.w-col-tiny-8', [m('a.header-logo.w-inline-block[href=\'/?ref=ctrse_header\'][title=\'Grasruts\']', ctrl.homeAttrs(), m('img[alt=\'Logo big\'][src=\'/assets/catarse_bootstrap/logo_big.png\']')), args.menuShort ? '' : m('div#menu-components', [m('a.w-hidden-small.w-hidden-tiny.header-link.w-nav-link[href=\'/start?ref=ctrse_header\']', { config: m.route }, I18n$1.t('header.submit', I18nScope$46())), m('a.w-hidden-small.w-hidden-tiny.header-link.w-nav-link[href=\'/explore?ref=ctrse_header\']', { config: m.route }, 'Explore'), m.component(menuSearch)])]), m('.text-align-right.w-col.w-col-4.w-col-small-4.w-col-tiny-4', [ctrl.user ? m.component(menuProfile, { user: ctrl.user }) : m('a.w-nav-link.header-link.w-nav-link.btn-edit.u-right[href=\'/login?ref=ctrse_header\']', I18n$1.t('header.signin', I18nScope$46()))])]), args.menuShort ? '' : m('.header-controls-mobile.w-hidden-main.w-hidden-medium', [m('a.header-link.w-nav-link[href=\'/en/start?ref=ctrse_header\']', { onclick: function onclick() {
                return m.route('/start');
            } }, I18n$1.t('header.submit', I18nScope$46())), m('a.header-link.w-nav-link[href=\'/en/explore?ref=ctrse_header\']', { onclick: function onclick() {
                return m.route('/explore');
            } }, 'Explore')])]);
    }
};

var I18nScope$49 = _.partial(h.i18nScope, 'layouts.footer');
var footer = {
    view: function view() {
        return m('footer.main-footer.main-footer-neg', [m('section.w-container', m('.w-row', [m('.w-col.w-col-9', m('.w-row', [m('.w-col.w-col-4.w-col-small-4.w-col-tiny-4.w-hidden-tiny', [m('.footer-full-signature-text.fontsize-small', I18n$1.t('titles.contact', I18nScope$49())),
        // m('a.link-footer[href=\'https://www.catarse.me/en/flex?ref=ctrse_footer\']',
        //     ' Grasruts flex'
        // ),
        m('a.link-footer[href=\'/team?ref=ctrse_footer\']', [I18n$1.t('links.team', I18nScope$49()), m.trust(' &lt;'), '3']), m('a.link-footer[href=\'https://www.facebook.com/grasruts\'][target=\'__blank\']', ' Facebook'), m('a.link-footer[href=\'https://twitter.com/grasruts\'][target=\'__blank\']', ' Twitter'), m('a.link-footer[href=\'http://instagram.com/the_grasruts/\'][target=\'__blank\']', ' Instagram'), m('a.link-footer[href=\'https://www.pinterest.com/grasruts\'][target=\'__blank\']', ' Pinterest'), m('a.link-footer[href=\'https://github.com/sushant12/jvn\'][target=\'__blank\']', ' Github'), m('a.link-footer[href=\'http://blogs.grasruts.com\'][target=\'__blank\']', ' Blog'), m('a.link-footer[href=\'/jobs?ref=ctrse_footer\']', I18n$1.t('links.jobs', I18nScope$49()))]), m('.w-col.w-col-4.w-col-small-4.w-col-tiny-4.footer-full-firstcolumn', [m('.footer-full-signature-text.fontsize-small', I18n$1.t('titles.about', I18nScope$49())), m('a.link-footer[href=\'#?ref=ctrse_footer\']', [I18n$1.t('links.how_it_works', I18nScope$49()), m.trust('&nbsp;')]), m('a.link-footer[href=\'https://grasruts.zendesk.com/hc/en-us/requests/new\'][target="_BLANK"]', I18n$1.t('links.contact', I18nScope$49())), m('a.link-footer[href=\'https://grasruts.zendesk.com/hc/en-us/\'][target="_BLANK"]', I18n$1.t('links.help_support', I18nScope$49())), m('a.link-footer[href=\'/en/terms-of-use?ref=ctrse_footer\']', I18n$1.t('links.terms', I18nScope$49())), m('a.link-footer[href=\'/en/privacy-policy?ref=ctrse_footer\']', I18n$1.t('links.privacy', I18nScope$49()))]), m('.w-col.w-col-4.w-col-small-4.w-col-tiny-4.footer-full-lastcolumn', [m('.footer-full-signature-text.fontsize-small', I18n$1.t('titles.sitemap', I18nScope$49())), m('a.w-hidden-small.w-hidden-tiny.link-footer[href=\'/en/start?ref=ctrse_footer\']', I18n$1.t('links.submit', I18nScope$49())), m('a.link-footer[href=\'/en/explore?ref=ctrse_footer\']', I18n$1.t('links.discover', I18nScope$49())), m('a.w-hidden-main.w-hidden-medium.w-hidden-small.link-footer[href=\'http://blogs.grasruts.com?ref=ctrse_footer\']', ' Blog'), m('a.w-hidden-main.w-hidden-medium.w-hidden-small.link-footer[href=\'#\']', I18n$1.t('links.contact', I18nScope$49())), m('a.w-hidden-tiny.link-footer[href=\'/en/explore?filter=score&ref=ctrse_footer\']', I18n$1.t('links.score', I18nScope$49())), m('a.w-hidden-tiny.link-footer[href=\'/en/explore?filter=online&ref=ctrse_footer\']', I18n$1.t('links.online', I18nScope$49())), m('a.w-hidden-tiny.link-footer[href=\'/en/explore?filter=finished&ref=ctrse_footer\']', I18n$1.t('links.finished', I18nScope$49()))])])), m('.w-col.w-col-3.column-social-media-footer', [m('.footer-full-signature-text.fontsize-small', I18n$1.t('titles.newsletter', I18nScope$49())), m('.w-form', m('form[accept-charset=\'UTF-8\'][action=\'' + h.getMailchimpUrl() + '\'][id=\'mailee-form\'][method=\'post\']', [m('.w-form.footer-newsletter', m('input.w-input.text-field.prefix[id=\'EMAIL\'][label=\'email\'][name=\'EMAIL\'][placeholder=\'' + I18n$1.t('texts.email', I18nScope$49()) + '\'][type=\'email\']')), m('button.w-inline-block.btn.btn-edit.postfix.btn-attached[style="padding:0;"]', m('img.footer-news-icon[alt=\'Icon newsletter\'][src=\'/assets/catarse_bootstrap/icon-newsletter.png\']'))])),
        // m('.footer-full-signature-text.fontsize-small',
        //     I18n.t('titles.social', I18nScope())
        // ),
        // m('.w-widget.w-widget-facebook.u-marginbottom-20',
        //     m('.facebook',
        //         m('.fb-like[data-colorscheme=\'dark\'][data-href=\'http://facebook.com/grasruts\'][data-layout=\'button_count\'][data-send=\'false\'][data-show-faces=\'false\'][data-title=\'\'][data-width=\'260\']')
        //     )
        // ),
        // m('.w-widget.w-widget-twitter', [
        //     m(`a.twitter-follow-button[href="httṕ://twitter.com/grasruts"][data-button="blue"][data-text-color="#FFFFFF][data-link-color="#FFFFFF"][data-width="224px"]`)
        // ]),
        m('.u-margintop-30', [m('.footer-full-signature-text.fontsize-small', 'Change language'), m('[id=\'google_translate_element\']')])])])), m('.w-container', m('.footer-full-copyleft', [m('img.u-marginbottom-20[alt=\'Logo footer\'][src=\'/assets/logo-footer.png\']'), m('.lineheight-loose', m('a.link-footer-inline[href=\'https://github.com/sushant12/jvn\'][target=\'blank\']', I18n$1.t('texts.copyleft', I18nScope$49()) + (' | ' + new Date().getFullYear() + ' | Open Source'))), m('img.u-marginbottom-20[alt=\'Logo footer\'][src=\'/assets/pme2.png\']')]))]);
    }
};

/*
 * UserFollowCard - Component
 * User info card with follow button
 *
 * Example:
 * m.component(c.UserFollowCard, {friend: friend})
 */

var UserFollowCard = {
    controller: function controller(args) {
        var friend = m.prop(args.friend);
        return {
            friend: friend
        };
    },
    view: function view(ctrl, args) {
        var friend = ctrl.friend(),
            profile_img = _$1.isEmpty(friend.avatar) ? '/assets/catarse_bootstrap/user.jpg' : friend.avatar;
        return m('.w-col.w-col-4', m('.card.card-backer.u-marginbottom-20.u-radius.u-text-center', [m('img.thumb.u-marginbottom-10.u-round[src=\'' + profile_img + '\']'), m('.fontsize-base.fontweight-semibold.lineheight-tight', m('a.link-hidden', { href: '/users/' + friend.friend_id }, userVM.displayName(friend))), m('.fontcolor-secondary.fontsize-smallest.u-marginbottom-10', _$1.isNull(friend.city) ? '' : m('.fontsize-smaller.fontcolor-secondary.u-marginbottom-10', friend.city + ', ' + friend.state)), m('.fontsize-smaller', [m('span.fontweight-semibold', friend.total_contributed_projects), ' Backed ', m.trust('&nbsp;'), '| ', m.trust('&nbsp;'), m('span.fontweight-semibold', friend.total_published_projects), ' Created']), m('.btn-bottom-card.w-row', [m('.w-col.w-col-3.w-col-small-4.w-col-tiny-3'), m('.w-col.w-col-6.w-col-small-4.w-col-tiny-6', m.component(UserFollowBtn, { following: friend.following, follow_id: friend.friend_id })), m('.w-col.w-col-3.w-col-small-4.w-col-tiny-3')])]));
    }
};

/**
 * window.c.userFriends component
 * Shows all friends cards and a follow-all button
 *
 * Example of use:
 * view: () => {
 *   ...
 *   m.component(c.userFriends, {user: user})
 *   ...
 * }
 */
var userFriends = {
    controller: function controller(args) {
        models.userFriend.pageSize(9);

        var userFriendVM = postgrest$1.filtersVM({ user_id: 'eq' }),
            user = args.user,
            friendListVM = postgrest$1.paginationVM(models.userFriend, 'following.asc,total_contributed_projects.desc', {
            Prefer: 'count=exact'
        }),
            allLoading = m.prop(false),
            followAll = function followAll() {
            allLoading(true);
            var l = postgrest$1.loaderWithToken(models.followAllFriends.postOptions({}));

            l.load().then(function () {
                friendListVM.firstPage(userFriendVM.parameters());
                allLoading(false);
            });
        };

        userFriendVM.user_id(user.user_id);

        if (!friendListVM.collection().length) {
            friendListVM.firstPage(userFriendVM.parameters());
        }

        return {
            friendListVM: friendListVM,
            followAll: followAll,
            allLoading: allLoading
        };
    },
    view: function view(ctrl, args) {
        var listVM = ctrl.friendListVM;
        return m('.w-section.bg-gray.before-footer.section', [m('.w-container', [m('.w-row.u-marginbottom-40.card.u-radius.card-terciary', [m('.w-col.w-col-7.w-col-small-6.w-col-tiny-6', [m('.fontsize-small', 'Start now! Follow all your friends or just a few of them to discover campaigns together!')]), m('.w-col.w-col-5.w-col-small-6.w-col-tiny-6', [ctrl.allLoading() ? h.loader() : m('a.w-button.btn.btn-medium', {
            onclick: ctrl.followAll
        }, 'Follow all your ' + (listVM.total() ? listVM.total() : '') + ' friends')])]), m('.w-row', [_$1.map(listVM.collection(), function (friend) {
            return m.component(UserFollowCard, { friend: friend });
        })]), m('.w-section.section.bg-gray', [m('.w-container', [m('.w-row.u-marginbottom-60', [m('.w-col.w-col-5', [m('.u-marginright-20')]), m.component(loadMoreBtn, { collection: listVM }), m('.w-col.w-col-5')])])])])]);
    }
};

/**
 * window.c.userFollows component
 * Shows all user follows cards
 *
 * Example of use:
 * view: () => {
 *   ...
 *   m.component(c.userFollows, {user: user})
 *   ...
 * }
 */
var userFollows = {
    controller: function controller(args) {
        models.userFollow.pageSize(9);
        var userFriendVM = postgrest$1.filtersVM({ user_id: 'eq' }),
            user = args.user,
            hash = m.prop(window.location.hash),
            followsListVM = postgrest$1.paginationVM(models.userFollow, 'created_at.desc', {
            Prefer: 'count=exact'
        });

        userFriendVM.user_id(user.user_id);
        if (!followsListVM.collection().length) {
            followsListVM.firstPage(userFriendVM.parameters());
        }

        return {
            followsListVM: followsListVM
        };
    },
    view: function view(ctrl, args) {
        var followsVM = ctrl.followsListVM;
        return m('.w-section.bg-gray.before-footer.section', [m('.w-container', [m('.w-row', [_$1.map(followsVM.collection(), function (friend) {
            return m.component(UserFollowCard, { friend: _$1.extend({}, { following: true, friend_id: friend.follow_id }, friend.source) });
        })]), m('.w-section.section.bg-gray', [m('.w-container', [m('.w-row.u-marginbottom-60', [m('.w-col.w-col-5', [m('.u-marginright-20')]), m.component(loadMoreBtn, { collection: followsVM }), m('.w-col.w-col-5')])])])])]);
    }
};

/**
 * window.c.userFollowers component
 * Shows all user followers cards
 *
 * Example of use:
 * view: () => {
 *   ...
 *   m.component(c.userFollowers, {user: user})
 *   ...
 * }
 */
var userFollowers = {
    controller: function controller(args) {
        models.userFollower.pageSize(9);
        var followersListVM = postgrest$1.paginationVM(models.userFollower, 'following.asc,created_at.desc', {
            Prefer: 'count=exact'
        }),
            user = args.user,
            userIdVM = postgrest$1.filtersVM({ follow_id: 'eq' });

        userIdVM.follow_id(user.user_id);

        if (!followersListVM.collection().length) {
            followersListVM.firstPage(userIdVM.parameters());
        }
        return {
            followersListVM: followersListVM
        };
    },
    view: function view(ctrl, args) {
        var followersVM = ctrl.followersListVM;
        return m('.w-section.bg-gray.before-footer.section', [m('.w-container', [m('.w-row', [_$1.map(followersVM.collection(), function (friend) {
            return m.component(UserFollowCard, { friend: _$1.extend({}, { friend_id: friend.user_id }, friend.source) });
        })]), m('.w-section.section.bg-gray', [m('.w-container', [m('.w-row.u-marginbottom-60', [m('.w-col.w-col-5', [m('.u-marginright-20')]), m.component(loadMoreBtn, { collection: followersVM }), m('.w-col.w-col-5')])])])])]);
    }
};

/**
 * window.c.userCreators component
 * Shows all user creators suggestions cards
 *
 * Example of use:
 * view: () => {
 *   ...
 *   m.component(c.userCreators, {user: user})
 *   ...
 * }
 */

var FollowFoundFriends = {
    controller: function controller(args) {
        var user = h.getUser(),
            hash = m.prop(window.location.hash),
            displayTabContent = function displayTabContent() {
            var c_opts = {
                user: user
            },
                tabs = {
                // '#creators': m.component(userCreators, c_opts),
                '#friends': m.component(userFriends, c_opts),
                '#follows': m.component(userFollows, c_opts),
                '#followers': m.component(userFollowers, c_opts)
            };

            hash(window.location.hash);

            if (_$1.isEmpty(hash()) || hash() === '#_=_') {
                return tabs['#friends'];
            }

            return tabs[hash()];
        };

        h.redrawHashChange();

        return {
            user: user,
            displayTabContent: displayTabContent
        };
    },
    view: function view(ctrl, args) {
        return m('div', [m('.w-section.dashboard-header', [m('.w-container', [m('.w-row.u-margintop-20.u-marginbottom-20', [m('.w-col.w-col-1'), m('.w-col.w-col-10.u-text-center', [m('.fontsize-larger.fontweight-semibold.u-marginbottom-10', 'Discover campaigns with your friends'), m('.fontsize-small', 'Follow your friends and we will notify you whenever they launch or support any campaign')]), m('.w-col.w-col-1')])])]), m('.divider.u-margintop-30'), m('.project-nav', m('.u-text-center.w-container', [
        //  m(`a[id="creators-link"][class="dashboard-nav-link ${h.hashMatch('#creators') ? 'selected' : ''}"] [href="#creators"]`,
        //  'Find filmmakers'
        // ),
        m('a[id="friends-link"][class="dashboard-nav-link ' + (h.hashMatch('#friends') || h.hashMatch('') ? 'selected' : '') + '"] [href="#friends"]', 'Find friends'), m('a[id="follows-link"][class="dashboard-nav-link ' + (h.hashMatch('#follows') ? 'selected' : '') + '"] [href="#follows"]', ['Following', m.trust('&nbsp;'), m('span.w-hidden-small.w-hidden-tiny.badge', ctrl.user.follows_count)]), m('a[id="followers-link"][class="dashboard-nav-link ' + (h.hashMatch('#followers') ? 'selected' : '') + '"] [href="#followers"]', ['Followers', m.trust('&nbsp;'), m('span.w-hidden-small.w-hidden-tiny.badge', ctrl.user.followers_count)])])), ctrl.displayTabContent()]);
    }
};

var I18nScope$50 = _$1.partial(h.i18nScope, 'projects.contributions');

var thankYou = {
    controller: function controller(args) {
        var recommendedProjects = userVM.getUserRecommendedProjects(),
            isSlip = args.contribution && !_$1.isEmpty(args.contribution.slip_url);

        var setEvents = function setEvents(el, isInitialized) {
            if (!isInitialized) {
                CatarseAnalytics.event({
                    cat: 'contribution_finish',
                    act: 'contribution_finished',
                    lbl: isSlip ? 'slip' : 'creditcard',
                    val: args.contribution.value,
                    extraData: {
                        contribution_id: args.contribution.contribution_id
                    }
                });

                CatarseAnalytics.checkout('' + args.contribution.contribution_id, '[' + args.contribution.project.permalink + '] ' + (args.contribution.reward ? args.contribution.reward.minimum_value : '10') + ' [' + (isSlip ? 'slip' : 'creditcard') + ']', '' + (args.contribution.reward ? args.contribution.reward.reward_id : ''), '' + args.contribution.project.category, '' + args.contribution.value, '' + args.contribution.value * args.contribution.project.service_fee);
            }
        };

        return {
            setEvents: setEvents,
            displayShareBox: h.toggleProp(false, true),
            isSlip: isSlip,
            recommendedProjects: recommendedProjects
        };
    },
    view: function view(ctrl, args) {
        return m('#thank-you', { config: ctrl.setEvents }, [m('.page-header.u-marginbottom-30', m('.w-container', m('.w-row', m('.w-col.w-col-10.w-col-push-1', [
        //  m('.u-marginbottom-20.u-text-center',
        //  m(`img.big.thumb.u-round[src='${args.contribution.project.user_thumb}']`)
        // ),
        m('#thank-you.u-text-center', !ctrl.isSlip ? [m('#creditcard-thank-you.fontsize-larger.text-success.u-marginbottom-20', I18n$1.t('thank_you.thank_you', I18nScope$50())), m('.fontsize-base.u-marginbottom-40', m.trust(I18n$1.t('thank_you.thank_you_text_html', I18nScope$50({
            total: args.contribution.project.total_contributions,
            email: args.contribution.contribution_email,
            link2: '/en/users/' + h.getUser().user_id + '/edit#contributions',
            link_email: '/en/users/' + h.getUser().user_id + '/edit#about_me'
        })))), m(".fontsize-base.fontweight-semibold.u-marginbottom-20", "Share with your friends and help this project hit the goal!")] : [m('#slip-thank-you.fontsize-largest.text-success.u-marginbottom-20', I18n$1.t('thank_you_slip.thank_you', I18nScope$50())), m('.fontsize-base.u-marginbottom-40', m.trust(I18n$1.t('thank_you_slip.thank_you_text_html', I18nScope$50({
            email: args.contribution.contribution_email,
            link_email: '/en/users/' + h.getUser().user_id + '/edit#about_me'
        }))))]), ctrl.isSlip ? '' : m('.w-row', [m('.w-hidden-small.w-hidden-tiny', [m('.w-sub-col.w-col.w-col-4', m.component(facebookButton, {
            url: 'http://www.grasruts.com/' + args.contribution.project.permalink + '?ref=ctrse_thankyou&utm_source=facebook.com&utm_medium=social&utm_campaign=project_share',
            big: true
        })), m('.w-sub-col.w-col.w-col-4', m.component(facebookButton, {
            messenger: true,
            big: true,
            url: 'http://www.grasruts.com/' + args.contribution.project.permalink + '?ref=ctrse_thankyou&utm_source=facebook.com&utm_medium=messenger&utm_campaign=thanks_share'
        })), m('.w-col.w-col-4', m('a.btn.btn-large.btn-tweet.u-marginbottom-20[href="https://twitter.com/intent/tweet?text=Acabei%20de%20apoiar%20o%20projeto%20' + args.contribution.project.name + '%20https://www.grasruts.com/' + args.contribution.project.permalink + '%3Fref%3Dtwitter%26utm_source%3Dtwitter.com%26utm_medium%3Dsocial%26utm_campaign%3Dproject_share"][target="_blank"]', [m('span.fa.fa-twitter'), ' Twitter']))]), m('.w-hidden-main.w-hidden-medium', [m('.u-marginbottom-30.u-text-center-small-only', m('button.btn.btn-large.btn-terciary.u-marginbottom-40', {
            onclick: ctrl.displayShareBox.toggle
        }, 'Share')), ctrl.displayShareBox() ? m(projectShareBox, {
            // Mocking a project m.prop
            project: m.prop({
                permalink: args.contribution.project.permalink,
                name: args.contribution.project.name
            }),
            displayShareBox: ctrl.displayShareBox
        }) : ''])])])))), m('.section.u-marginbottom-40', m('.w-container', ctrl.isSlip ? m('.w-row', m('.w-col.w-col-8.w-col-offset-2', m('iframe.slip', {
            src: args.contribution.slip_url,
            width: '100%',
            height: '905px',
            frameborder: '0',
            style: 'overflow: hidden;'
        }))) : [m('.fontsize-large.fontweight-semibold.u-marginbottom-30.u-text-center', I18n$1.t('thank_you.project_recommendations', I18nScope$50())), m.component(projectRow, {
            collection: ctrl.recommendedProjects,
            ref: 'ctrse_thankyou_r'
        })]))]);
    }
};

var I18nScope$51 = _$1.partial(h.i18nScope, 'users.edit.email_confirmation');

var CheckEmail = {
    controller: function controller(args) {
        var userID = h.getUserID(),
            user = userVM.fetchUser(userID),
            confirmedEmail = m.prop(false),
            hideAlert = m.prop(false);

        return {
            confirmedEmail: confirmedEmail,
            hideAlert: hideAlert,
            user: user,
            checkEmail: function checkEmail() {
                return m.request({
                    method: 'PUT',
                    url: '/users/' + userID + '.json',
                    data: {
                        user: {
                            confirmed_email_at: true
                        }
                    },
                    config: h.setCsrfToken
                }).then(function (data) {
                    confirmedEmail(true);
                    window.setTimeout(function () {
                        hideAlert(true);
                        m.redraw(true);
                    }, 4000);
                });
            }
        };
    },
    view: function view(ctrl, args) {
        var user = ctrl.user();
        if (user) {
            var userCreatedRecently = moment().isBefore(moment(user.created_at).add(2, 'days'));

            return user && !userCreatedRecently && !user.email_active && !ctrl.hideAlert() ? m('.card-alert.section.u-text-center', { style: args.menuTransparency ? { 'padding-top': '100px' } : {} }, [m('.w-container', ctrl.confirmedEmail() ? [m('.fontsize-large.fontweight-semibold', I18n$1.t('confirmed_title', I18nScope$51())), m('.fontsize-large.fontweight-semibold.u-marginbottom-20', I18n$1.t('confirmed_sub', I18nScope$51()))] : [m('.fontsize-large.fontweight-semibold', _$1.isNull(user.name) ? "Hi" : I18n$1.t('hello', I18nScope$51({ name: user.name }))), m('.fontsize-large.fontweight-semibold.u-marginbottom-20', I18n$1.t('hello_sub', I18nScope$51())), m('.fontsize-base.u-marginbottom-10', I18n$1.t('hello_email', I18nScope$51({ email: user.email }))), m('.w-row', [m('.w-col.w-col-3'), m('.w-col.w-col-3', [m('button.btn.btn-medium.btn-terciary.w-button', {
                onclick: ctrl.checkEmail
            }, 'Yes!')]), m('.w-col.w-col-3', [m('a.btn.btn-medium.w-button[href="/users/' + user.id + '/edit#about_me"]', 'Edit Email')]), m('.w-col.w-col-3')])])]) : m('div');
        }

        return m('div');
    }
};

var c = {
    root: {
        AdminUsers: adminUsers,
        AdminContributions: adminContributions,
        AdminBalanceTranfers: adminBalanceTranfers,
        ClipboardCopy: copyTextInput,
        Flex: Flex,
        Insights: insights,
        Posts: posts,
        Jobs: jobs,
        LiveStatistics: liveStatistics,
        ProjectsContributionReport: projectContributionReport,
        ProjectsDashboard: projectsDashboard,
        ProjectsExplore: projectsExplore,
        ProjectsHome: projectsHome,
        ProjectsShow: projectsShow,
        UsersShow: usersShow,
        UsersEdit: usersEdit,
        ProjectEdit: projectEdit,
        ProjectsContribution: projectsContribution,
        ProjectsPayment: projectsPayment,
        ProjectsReward: projectsReward,
        ThankYou: thankYou,
        Publish: publish,
        Start: start,
        Team: team,
        Menu: menu,
        Footer: footer,
        FollowFoundFriends: FollowFoundFriends,
        CheckEmail: CheckEmail,
        projectEditUserAbout: projectEditUserAbout,
        projectEditUserSettings: projectEditUserSettings,
        projectEditReward: projectEditReward,
        projectEditBasic: projectEditBasic,
        projectEditDescription: projectEditDescription,
        projectEditBudget: projectEditBudget,
        projectEditVideo: projectEditVideo,
        projectEditGoal: projectEditGoal,
        projectEditCard: projectEditCard
    }
};

return c;

}(m,I18n,_,moment,$,postgrest,CatarseAnalytics,replaceDiacritics,Chart));
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3JjLyoqLyouanMiLCJzb3VyY2VzIjpbXSwic291cmNlc0NvbnRlbnQiOltdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7IiwicHJlRXhpc3RpbmdDb21tZW50IjoiLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2NoYXJzZXQ9dXRmLTg7YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqcHVkV3hzTENKemIzVnlZMlZ6SWpwYlhTd2ljMjkxY21ObGMwTnZiblJsYm5RaU9sdGRMQ0p1WVcxbGN5STZXMTBzSW0xaGNIQnBibWR6SWpvaU96czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN0luMD0ifQ==
