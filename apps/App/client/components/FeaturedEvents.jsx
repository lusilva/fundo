/* global React, Meteor */

/**
 * Represents the featured events shown at the top of the page.
 *
 * TODO: Needs to be cleaned up a lot.
 * @class
 * @extends React.Component
 *
 */
export default class FeaturedEvents extends React.Component {

    /** @inheritDoc */
    componentDidMount() {
        // Setup code to make the animation of the events sliding in.
        var projectsContainer = $('.cd-projects-wrapper'),
            projectsSlider = projectsContainer.children('.cd-slider'),
            sliderNav = $('.cd-slider-navigation');

        var resizing = false;

        //if on desktop - set a width for the projectsSlider element
        setSliderContainer();
        $(window).on('resize', function () {
            //on resize - update projectsSlider width and translate value
            if (!resizing) {
                (!window.requestAnimationFrame) ? setSliderContainer() : window.requestAnimationFrame(setSliderContainer);
                resizing = true;
            }
        });

        //animate single project - entrance animation
        setTimeout(function () {
            showProjectPreview(projectsSlider.children('li').eq(0));
        }, 200);


        //go to next/pre slide - clicking on the next/prev arrow
        sliderNav.on('click', '.next', function () {
            nextSides(projectsSlider);
        });
        sliderNav.on('click', '.prev', function () {
            prevSides(projectsSlider);
        });

        //go to next/pre slide - keyboard navigation
        $(document).keyup(function (event) {
            if (event.which == '37' && !(sliderNav.find('.prev').hasClass('inactive'))) {
                prevSides(projectsSlider);
            } else if (event.which == '39' && !(sliderNav.find('.next').hasClass('inactive'))) {
                nextSides(projectsSlider);
            }
        });

        function showProjectPreview(project) {
            if (project.length > 0) {
                setTimeout(function () {
                    project.addClass('slides-in');
                    showProjectPreview(project.next());
                }, 50);
            }
        }

        function setSliderContainer() {
            var slides = projectsSlider.children('li'),
                slideWidth = slides.eq(0).width(),
                marginLeft = Number(projectsSlider.children('li').eq(1).css('margin-left').replace('px', '')),
                sliderWidth = ( slideWidth + marginLeft ) * ( slides.length + 1 ) + 'px',
                slideCurrentIndex = projectsSlider.children('li.current').index();
            projectsSlider.css('width', sliderWidth);
            ( slideCurrentIndex != 0 ) && setTranslateValue(projectsSlider, (  slideCurrentIndex * (slideWidth + marginLeft) + 'px'));
            resizing = false;
        }

        function nextSides(slider) {
            var actual = slider.children('.current'),
                index = actual.index(),
                following = actual.nextAll('li').length,
                width = actual.width(),
                marginLeft = Number(slider.children('li').eq(1).css('margin-left').replace('px', ''));

            index = (following > 4 ) ? index + 3 : index + following - 2;
            //calculate the translate value of the slider container
            var translate = index * (width + marginLeft) + 'px';

            slider.addClass('next');
            setTranslateValue(slider, translate);
            slider.one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function () {
                updateSlider('next', actual, slider, following);
            });

            if ($('.no-csstransitions').length > 0) updateSlider('next', actual, slider, following);
        }

        function prevSides(slider) {
            var actual = slider.children('.previous'),
                index = actual.index(),
                width = actual.width(),
                marginLeft = Number(slider.children('li').eq(1).css('margin-left').replace('px', ''));

            var translate = index * (width + marginLeft) + 'px';

            slider.addClass('prev');
            setTranslateValue(slider, translate);
            slider.one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function () {
                updateSlider('prev', actual, slider);
            });

            if ($('.no-csstransitions').length > 0) updateSlider('prev', actual, slider);
        }

        function updateSlider(direction, actual, slider, numerFollowing) {
            if (direction == 'next') {

                slider.removeClass('next').find('.previous').removeClass('previous');
                actual.removeClass('current');
                if (numerFollowing > 4) {
                    actual.addClass('previous').next('li').next('li').next('li').addClass('current');
                } else if (numerFollowing == 4) {
                    actual.next('li').next('li').addClass('current').prev('li').prev('li').addClass('previous');
                } else {
                    actual.next('li').addClass('current').end().addClass('previous');
                }
            } else {

                slider.removeClass('prev').find('.current').removeClass('current');
                actual.removeClass('previous').addClass('current');
                if (actual.prevAll('li').length > 2) {
                    actual.prev('li').prev('li').prev('li').addClass('previous');
                } else {
                    ( !slider.children('li').eq(0).hasClass('current') ) && slider.children('li').eq(0).addClass('previous');
                }
            }

            updateNavigation();
        }

        function updateNavigation() {
            //update visibility of next/prev buttons according to the visible slides
            var current = projectsContainer.find('li.current');
            (current.is(':first-child')) ? sliderNav.find('.prev').addClass('inactive') : sliderNav.find('.prev').removeClass('inactive');
            (current.nextAll('li').length < 3 ) ? sliderNav.find('.next').addClass('inactive') : sliderNav.find('.next').removeClass('inactive');
        }

        function setTranslateValue(item, translate) {
            item.css({
                '-moz-transform': 'translateX(-' + translate + ')',
                '-webkit-transform': 'translateX(-' + translate + ')',
                '-ms-transform': 'translateX(-' + translate + ')',
                '-o-transform': 'translateX(-' + translate + ')',
                'transform': 'translateX(-' + translate + ')'
            });
        }
    }

    render() {
        return (
            <div className="cd-projects-wrapper">
                <ul className="cd-slider">
                    <li className="current">
                        <div className="project-info">
                            <h2>Event 1</h2>
                            <p>Lorem ipsum dolor sit amet.</p>
                        </div>
                    </li>

                    <li>
                        <div className="project-info">
                            <h2>Event 2</h2>
                            <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Dolorum, dicta.</p>
                        </div>
                    </li>

                    <li>
                        <div className="project-info">
                            <h2>Event 3</h2>
                            <p>Lorem ipsum dolor sit amet.</p>
                        </div>
                    </li>

                    <li>
                        <div className="project-info">
                            <h2>Event 4</h2>
                            <p>Lorem ipsum dolor sit amet, consectetur adipisicing.</p>
                        </div>
                    </li>
                </ul>

                <ul className="cd-slider-navigation cd-img-replace">
                    <li><a className="prev inactive"><i className="chevron circle left fitted big icon" /></a></li>
                    <li><a className="next"><i className="chevron circle right fitted big icon" /></a></li>
                </ul>
            </div>
        )
    }
}