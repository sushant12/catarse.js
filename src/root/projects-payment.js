import m from 'mithril';
import _ from 'underscore';
import I18n from 'i18n-js';
import h from '../h';
import contributionVM from '../vms/contribution-vm';
import rewardVM from '../vms/reward-vm';
import paymentVM from '../vms/payment-vm';
import projectVM from '../vms/project-vm';
import usersVM from '../vms/user-vm';
import faqBox from '../c/faq-box';
import paymentForm from '../c/payment-form';
import inlineError from '../c/inline-error';
// import UserOwnerBox from '../c/user-owner-box';

const I18nScope = _.partial(h.i18nScope, 'projects.contributions.edit');
const I18nIntScope = _.partial(h.i18nScope, 'projects.contributions.edit_international');

const projectsPayment = {
    controller(args) {
        const project = projectVM.currentProject,
              vm = paymentVM(),
              showPaymentForm = m.prop(false),
              contribution = contributionVM.getCurrentContribution(),
              reward = m.prop(contribution().reward),
              value = contribution().value,
              phoneMask = _.partial(h.mask, '(99) 9999-99999'),
              documentMask = _.partial(h.mask, '999.999.999-99'),
              documentCompanyMask = _.partial(h.mask, '99.999.999/9999-99'),
              zipcodeMask = _.partial(h.mask, '99999-999'),
              isCnpj = m.prop(false),
              currentUserID = h.getUserID(),
              user = usersVM.getCurrentUser();

        const shippingFee = () => _.findWhere(rewardVM.fees(), { id: contribution().shipping_fee_id });

        const validateForm = () => {
            if (vm.validate()) {
                vm.similityExecute(contribution().id);

                var userData = {
                    // country_id: fields.country_id(),
                    country_id: 168,
                    address_street: vm.fields.street(),
                    address_city: vm.fields.city(),
                    phone_number: document.getElementById('phone').value,
                    cpf: vm.fields.ownerDocument(),
                    name: vm.fields.completeName(),
                };
                m.request({
                    method: 'PUT',
                    url: `/users/${currentUserID}.json`,
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
                    address_phone_number: vm.fields.phone(),
                    // card_owner_document: creditCardFields.cardOwnerDocument()
                };
                m.request({
                    method: 'PUT',
                    url: `/projects/${projectVM.currentProject().project_id}/contributions/${contribution().id}.json`,
                    data: { contribution: contributionData },
                    config: h.setCsrfToken
                });

                return h.navigateTo(`/projects/${projectVM.currentProject().project_id}/contributions/${contribution().id}/payment_method`);
            }
        };

        const fieldHasError = (fieldName) => {
            const fieldWithError = _.findWhere(vm.fields.errors(), {
                field: fieldName
            });

            return fieldWithError ? m.component(inlineError, {
                message: fieldWithError.message
            }) : '';
        };

        const setStateOther = (el, isInit) => {
            if (!isInit) {
                vm.fields.userState('');
            }
        };

        const applyDocumentMask = (value) => {
            if (value.length > 14) {
                isCnpj(true);
                vm.fields.ownerDocument(documentCompanyMask(value));
            } else {
                isCnpj(false);
                vm.fields.ownerDocument(documentMask(value));
            }
        };

        const applyZipcodeMask = _.compose(vm.fields.zipCode, zipcodeMask);

        const applyPhoneMask = _.compose(vm.fields.phone, phoneMask);

        const addressChange = fn => (e) => {
            CatarseAnalytics.oneTimeEvent({
                cat: 'contribution_finish',
                act: vm.isInternational ? 'contribution_address_br' : 'contribution_address_int'
            });

            if (_.isFunction(fn)) {
                fn(e);
            }
        };

        const scope = attr => vm.isInternational()
                   ? I18nIntScope(attr)
                   : I18nScope(attr);

        const isLongDescription = reward => reward.description && reward.description.length > 110;

        if (_.isNull(currentUserID)) {
            return h.navigateToDevise();
        }
        rewardVM.getStates();
        rewardVM.getFees(reward()).then(rewardVM.fees);
        vm.similityExecute(contribution().id);
        projectVM.getCurrentProject();

        return {
            addressChange,
            applyDocumentMask,
            applyZipcodeMask,
            applyPhoneMask,
            fieldHasError,
            setStateOther,
            validateForm,
            showPaymentForm,
            contribution,
            reward,
            value,
            scope,
            isCnpj,
            vm,
            user,
            project,
            shippingFee,
            isLongDescription,
            toggleDescription: h.toggleProp(false, true)
        };
    },
    view(ctrl) {
        const user = ctrl.user(),
              project = ctrl.project,
              // formatedValue = h.formatNumber(Number(ctrl.value), 2, 3);
              formatedValue = Number(ctrl.value);
        return m('#project-payment.w-section.w-clearfix.section', !_.isEmpty(project) ? [
            m('.w-col',
                m('.w-clearfix.w-hidden-main.w-hidden-medium.card.u-radius.u-marginbottom-20', [
                    m('.fontsize-smaller.fontweight-semibold.u-marginbottom-20',
                        I18n.t('selected_reward.value', ctrl.scope())
                    ),
                    m('.w-clearfix',
                        [
                            m('.fontsize-larger.text-success.u-left',
                                `Rs ${formatedValue}`
                            )
                            // m(`a.alt-link.fontsize-smaller.u-right[href="/projects/${projectVM.currentProject().project_id}/contributions/new${ctrl.reward().id ? `?reward_id=${ctrl.reward().id}` : ''}"]`,
                            //     'Edit'
                            // )
                        ]
                    ),
                    m('.divider.u-marginbottom-10.u-margintop-10'),
                    m('.back-payment-info-reward', [
                        m('.fontsize-smaller.fontweight-semibold.u-marginbottom-10',
                            I18n.t('selected_reward.reward', ctrl.scope())
                        ),
                        m('.fontsize-smallest.fontweight-semibold',
                            ctrl.reward().title
                        ),
                        m('.fontsize-smallest.reward-description.opened.fontcolor-secondary', {
                            class: ctrl.isLongDescription(ctrl.reward())
                                       ? ctrl.toggleDescription() ? 'extended' : ''
                                       : 'extended'
                        }, ctrl.reward().description
                                ? ctrl.reward().description
                                : ''
                        ),
                        ctrl.isLongDescription(ctrl.reward()) ? m('a[href="javascript:void(0);"].link-hidden.link-more.u-marginbottom-20', {
                            onclick: ctrl.toggleDescription.toggle
                        }, [
                            ctrl.toggleDescription() ? 'less ' : 'more ',
                            m('span.fa.fa-angle-down', {
                                class: ctrl.toggleDescription() ? 'reversed' : ''
                            })
                        ]) : '',
                        ctrl.reward().deliver_at ? m('.fontcolor-secondary.fontsize-smallest.u-margintop-10',
                            [
                                m('span.fontweight-semibold',
                                    'Estimated delivery time:'
                                ),
                                ` ${h.momentify(ctrl.reward().deliver_at, 'MMM/YYYY')}`
                            ]
                        ) : '',
                        (rewardVM.hasShippingOptions(ctrl.reward()) || ctrl.reward().shipping_options === 'presential')
                            ? m('.fontcolor-secondary.fontsize-smallest', [
                                m('span.fontweight-semibold',
                                    'Shipping method: '
                                ),
                                I18n.t(`shipping_options.${ctrl.reward().shipping_options}`, { scope: 'projects.contributions' })
                            ])
                            : ''
                    ])
                ])
            ),

            m('.w-container',
                m('.w-row', [
                    m('.w-col.w-col-8', [
                        m('.w-form', [
                            m('form.u-marginbottom-40', [
                                m('.u-marginbottom-40.u-text-center-small-only', [
                                    m('.fontweight-semibold.lineheight-tight.fontsize-large',
                                        I18n.t('title', ctrl.scope())
                                    ),
                                    m('.fontsize-smaller',
                                        I18n.t('required', ctrl.scope())
                                    )
                                ]),
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
                                ((user.name && user.owner_document) ? '' : m('.w-row', [
                                    m('.w-col.w-col-7.w-sub-col', [
                                        m('label.field-label.fontweight-semibold[for=\'complete-name\']',
                                          I18n.t('fields.complete_name', ctrl.scope())
                                         ),
                                        m('input.w-input.text-field[id=\'complete-name\'][name=\'complete-name\']', {
                                            onfocus: ctrl.vm.resetFieldError('completeName'),
                                            class: ctrl.fieldHasError('completeName') ? 'error' : false,
                                            type: 'text',
                                            onchange: m.withAttr('value', ctrl.vm.fields.completeName),
                                            value: ctrl.vm.fields.completeName(),
                                            placeholder: 'Full name'
                                        }),
                                        ctrl.fieldHasError('completeName')
                                    ]),
                                    m('.w-col.w-col-5', (!ctrl.vm.isInternational() ? '' : [
                                        m('label.field-label.fontweight-semibold[for=\'document\']',
                                          'PAN'
                                         ),
                                        m('input.w-input.text-field[id=\'document\']', {
                                            onfocus: ctrl.vm.resetFieldError('ownerDocument'),
                                            class: ctrl.fieldHasError('ownerDocument') ? 'error' : false,
                                            type: 'tel',
                                            onchange: m.withAttr('value', ctrl.vm.fields.ownerDocument),
                                            // onkeyup: m.withAttr('value', ctrl.applyDocumentMask),
                                            value: ctrl.vm.fields.ownerDocument()
                                        }),
                                        ctrl.fieldHasError('ownerDocument')
                                    ])),
                                ])),
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
                                ctrl.vm.fields.anonymous() ? m('.card.card-message.u-radius.zindex-10.fontsize-smallest',
                                    m('div', [
                                        m('span.fontweight-bold', [
                                            I18n.t('anonymous_confirmation_title', ctrl.scope()),
                                            m('br')
                                        ]),
                                        m('br'),
                                        I18n.t('anonymous_confirmation', ctrl.scope())
                                    ])
                                ) : ''
                            ])
                        ]),
                        m('.u-marginbottom-40',
                            m('.w-form', [
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
                                m('.w-row', [
                                    m('.w-col.w-col-4.w-sub-col',[
                                        m('label.field-label.fontweight-semibold[for=\'street\']',
                                            I18n.t('fields.street', ctrl.scope())
                                        ),
                                        m('input.w-input.text-field[id=\'street\']', {
                                            type: 'text',
                                            onfocus: ctrl.vm.resetFieldError('street'),
                                            class: ctrl.fieldHasError('street') ? 'error' : false,
                                            onchange: ctrl.addressChange(m.withAttr('value', ctrl.vm.fields.street)),
                                            value: ctrl.vm.fields.street(),
                                            placeholder: 'My Home Street'
                                        }),
                                        ctrl.fieldHasError('street'),
                                    ]),
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
                                    m('.w-col.w-col-4.w-sub-col', [
                                        m('label.field-label.fontweight-semibold[for=\'city\']',
                                            I18n.t('fields.city', ctrl.scope())
                                        ),
                                        m('input.w-input.text-field[id=\'city\']', {
                                            onfocus: ctrl.vm.resetFieldError('city'),
                                            class: ctrl.fieldHasError('city') ? 'error' : false,
                                            type: 'text',
                                            onchange: ctrl.addressChange(m.withAttr('value', ctrl.vm.fields.city)),
                                            value: ctrl.vm.fields.city(),
                                            placeholder: 'City'
                                        }),
                                        ctrl.fieldHasError('city')
                                    ]),
                                    // m('.w-col.w-col-4', [
                                    //     m('label.field-label.fontweight-semibold[for=\'state\']',
                                    //         I18n.t('fields.state', ctrl.scope())
                                    //     ),
                                    //     ctrl.vm.isInternational() ? m('input.w-input.text-field[id=\'address-state\']', {
                                    //         onchange: ctrl.addressChange(m.withAttr('value', ctrl.vm.fields.userState)),
                                    //         class: ctrl.fieldHasError('userState') ? 'error' : false,
                                    //         value: ctrl.vm.fields.userState()
                                    //     }) : m('select.w-select.text-field[id=\'address-state\']', {
                                    //         onfocus: ctrl.vm.resetFieldError('userState'),
                                    //         class: ctrl.fieldHasError('userState') ? 'error' : false,
                                    //         onchange: ctrl.addressChange(m.withAttr('value', ctrl.vm.fields.userState)),
                                    //         value: ctrl.vm.fields.userState()
                                    //     }, _.map(ctrl.vm.fields.states(), (state, idx) => m('option', {
                                    //         value: state.acronym,
                                    //         selected: state.acronym === ctrl.vm.fields.userState()
                                    //     }, state.name))
                                    //     ),
                                    //     ctrl.fieldHasError('userState')
                                    // ])
                                ]),
                                ctrl.vm.isInternational() ? m('.w-row', [
                                    m('.w-col.w-col-6', [
                                        m('label.field-label.fontweight-semibold[for=\'phone\']',
                                            I18n.t('fields.phone', ctrl.scope())
                                        ),
                                        m('input.w-input.text-field[id=\'phone\']', {
                                            onfocus: ctrl.vm.resetFieldError('phone'),
                                            class: ctrl.fieldHasError('phone') ? 'error' : false,
                                            type: 'tel',
                                            onchange: m.withAttr('value', ctrl.vm.fields.phone),
                                            // onkeyup: m.withAttr('value', ctrl.applyPhoneMask),
                                            value: ctrl.vm.fields.phone()
                                        }),
                                        ctrl.fieldHasError('phone')
                                    ])
                                ]) : ''
                            ])
                        ),
                        m('.w-row.u-marginbottom-40',
                            !ctrl.showPaymentForm() ? m('.w-col.w-col-push-3.w-col-6',
                                m('button.btn.btn-large[type=submit]', {
                                    onclick: () => CatarseAnalytics.event({ cat: 'contribution_finish', act: 'contribution_next_click' }, ctrl.validateForm)
                                },
                                    I18n.t('next_step', ctrl.scope())
                                )
                            ) : ''
                        ),
                        ctrl.showPaymentForm() ? m.component(paymentForm, {
                            vm: ctrl.vm,
                            contribution_id: ctrl.contribution().id,
                            project_id: projectVM.currentProject().project_id,
                            user_id: user.id
                        }) : ''
                    ]),
                    m('.w-col.w-col-4', [
                        m('.card.u-marginbottom-20.u-radius.w-hidden-small.w-hidden-tiny',
                            [
                                m('.fontsize-smaller.fontweight-semibold.u-marginbottom-20',
                                    I18n.t('selected_reward.value', ctrl.scope())
                                ),
                                m('.w-clearfix',
                                    [
                                        m('.fontsize-larger.text-success.u-left',
                                            `Rs ${formatedValue}`
                                        )
                                        // m(`a.alt-link.fontsize-smaller.u-right[href="/projects/${projectVM.currentProject().project_id}/contributions/new${ctrl.reward().id ? `?reward_id=${ctrl.reward().id}` : ''}"]`,
                                        //     'Edit'
                                        // )
                                    ]
                                ),
                                m('.divider.u-marginbottom-10.u-margintop-10'),
                                m('.back-payment-info-reward', [
                                    m('.fontsize-smaller.fontweight-semibold.u-marginbottom-10',
                                        I18n.t('selected_reward.reward', ctrl.scope())
                                    ),
                                    m('.fontsize-smallest.fontweight-semibold',
                                        ctrl.reward().title
                                    ),
                                    m('.fontsize-smallest.reward-description.opened.fontcolor-secondary', {
                                        class: ctrl.isLongDescription(ctrl.reward())
                                                   ? ctrl.toggleDescription() ? 'extended' : ''
                                                   : 'extended'
                                    }, ctrl.reward().description
                                            ? ctrl.reward().description
                                            : ''
                                    ),
                                    ctrl.isLongDescription(ctrl.reward()) ? m('a[href="javascript:void(0);"].link-hidden.link-more.u-marginbottom-20', {
                                        onclick: ctrl.toggleDescription.toggle
                                    }, [
                                        ctrl.toggleDescription() ? 'menos ' : 'mais ',
                                        m('span.fa.fa-angle-down', {
                                            class: ctrl.toggleDescription() ? 'reversed' : ''
                                        })
                                    ]) : '',
                                    ctrl.reward().deliver_at ? m('.fontcolor-secondary.fontsize-smallest.u-margintop-10',
                                        [
                                            m('span.fontweight-semibold',
                                                'Entrega prevista:'
                                            ),
                                            ` ${h.momentify(ctrl.reward().deliver_at, 'MMM/YYYY')}`
                                        ]
                                    ) : '',
                                    (rewardVM.hasShippingOptions(ctrl.reward()) || ctrl.reward().shipping_options === 'presential')
                                        ? m('.fontcolor-secondary.fontsize-smallest', [
                                            m('span.fontweight-semibold',
                                                'Forma de envio: '
                                            ),
                                            I18n.t(`shipping_options.${ctrl.reward().shipping_options}`, { scope: 'projects.contributions' })
                                        ])
                                        : '',
                                    m('div',
                                        // ctrl.contribution().shipping_fee_id ? [
                                        //     m('.divider.u-marginbottom-10.u-margintop-10'),
                                        //     m('.fontsize-smaller.fontweight-semibold',
                                        //         'Destino da recompensa:'
                                        //     ),
                                        //     m(`a.alt-link.fontsize-smaller.u-right[href="/projects/${projectVM.currentProject().project_id}/contributions/new${ctrl.reward().id ? `?reward_id=${ctrl.reward().id}` : ''}"]`,
                                        //         'Editar'
                                        //     ),
                                        //     m('.fontsize-smaller', { style: 'padding-right: 42px;' },
                                        //         `${rewardVM.feeDestination(ctrl.reward(), ctrl.contribution().shipping_fee_id)}`
                                        //     ),
                                        //     m('p.fontsize-smaller', `(R$ ${rewardVM.shippingFeeById(ctrl.contribution().shipping_fee_id) ? rewardVM.shippingFeeById(ctrl.contribution().shipping_fee_id).value : '...'})`)
                                        // ] : ''
                                    )
                                ]),
                        ])
                        // m.component(faqBox, {
                        //     mode: project.mode,
                        //     vm: ctrl.vm,
                        //     faq: ctrl.vm.faq(project.mode),
                        //     projectUserId: project.user_id
                        // })
                    ])
                ])
            )
        ] : h.loader());
    }
};

export default projectsPayment;
