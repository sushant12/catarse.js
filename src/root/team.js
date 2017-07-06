import m from 'mithril';
import teamTotal from '../c/team-total';
import teamMembers from '../c/team-members';

const team = {
    view() {
        return m('#static-team-app', [
            m('.w-section.hero-who.hero-full', [
                m('.w-container.u-text-center', [
                    m('img.icon-hero[src="/assets/logo-yellow.png"]'),
                    m('.u-text-center.u-marginbottom-20.fontsize-largest',
                      'Meet Our Team')
                ])
            ]),
            m.component(teamTotal),
            m.component(teamMembers)
        ]);
    }
};

export default team;
