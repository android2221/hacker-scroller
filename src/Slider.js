// Import Swiper React components
import SwiperCore, { Navigation, Pagination, Virtual } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import React, { Component } from "react";
import ClipLoader from "react-spinners/ClipLoader";
import Moment from 'react-moment';

// Import Swiper styles
import 'swiper/swiper.scss';
import './Slider.scss';

// install Swiper modules
SwiperCore.use([Virtual]);

class Slider extends Component {
    constructor() {
        super();
        this.state = {
            topStories: [],
            storyData: [],
            currentStoriesSlice: [],
            displayData: [],
            currentOffset: 10,
            storiesToLoad: 10,
            loading: true,
        }
    }

    async componentDidMount() {
        this.getData();
    }

    slideChange(swiper) {
        var slideIndex = swiper.activeIndex;
        if (slideIndex >= (this.state.currentOffset - this.state.storiesToLoad) - 2) {
            this.getData();
            swiper.update();
        }
        swiper.update();
    }

    async getData() {
        this.setState({ loading: true });

        var startIndex = this.state.currentOffset - this.state.storiesToLoad;

        const topStoriesResult = await fetch(`https://hacker-news.firebaseio.com/v0/topstories.json`);
        const topStoriesJson = await topStoriesResult.json();
        const currentStoriesSlice = topStoriesJson.slice(startIndex, this.state.currentOffset);

        var storyDataArray = await Promise.all(currentStoriesSlice.map(async (x) => {
            var storyResponse = await fetch(`https://hacker-news.firebaseio.com/v0/item/${x}.json`);
            var story = await storyResponse.json();

            if (story.kids) {
                var topComments = await Promise.all(story.kids.map(async comment => {
                    var result = await fetch(`https://hacker-news.firebaseio.com/v0/item/${comment}.json`);
                    return await result.json();
                }));
            }
            
            return {story: story, topComments: topComments}

        }));

        var currentDataArray = this.state.storyData;

        currentDataArray.push(...storyDataArray);

        var newOffset = this.state.currentOffset + this.state.storiesToLoad;

        const displayData = this.state.storyData.map(x => {
            const story = x.story;
            const topComments = x.topComments;

            // Handle things that don't have a URL
            // Go to hacker news if not

            var calculatedUrl;
            var displayUrl;
            var hnUrl = `https://news.ycombinator.com/item?id=${story.id}`;

            if (story.url) {
                var urlParts = story.url.split('/');
                calculatedUrl = story.url;
                displayUrl = urlParts[2];
            } else {
                displayUrl = 'news.ycombinator.com';
                calculatedUrl = `https://news.ycombinator.com/item?id=${story.id}`;
            }

            return (
                <SwiperSlide key={story.id} id={story.id}>
                    <div className="hacker-card">
                        <div className='story-title'>
                            <a href={calculatedUrl}>
                                {story.title}
                            </a>
                        </div>
                        <div className='story-url'>{displayUrl}</div>
                        <div className='points-info'>
                            {story.score} points by {story.by} | {story.descendants} comments | <Moment unix fromNow>{story.time}</Moment>
                        </div>
                        <div className='top-comments'>
                            {topComments ? topComments.map(comment => 
                                <div className="comment">{comment.by} said:
                                    <div className="comment-text" dangerouslySetInnerHTML={{__html: comment.text}}></div>
                                </div>
                                ) : 'no comments'}
                        </div>
                        <div className="see-on-hn-overlay">
                            <div className="see-on-hn">
                                <a href={hnUrl}>Read on HN</a>
                            </div>
                        </div>
                    </div>
                </SwiperSlide>
            )
        });

        this.setState({
            topStories: topStoriesJson,
            storyData: currentDataArray,
            currentStoriesSlice: currentStoriesSlice,
            currentOffset: newOffset,
            displayData: displayData,
            loading: false
        });
    }

    render() {
        if (this.state.displayData.length > 0) {
            return (
                <div className='slider-container'>
                    <Swiper
                        spaceBetween={50}
                        slidesPerView={1}
                        onSlideChange={(swiper) => this.slideChange(swiper)}
                        direction='vertical'>
                        {this.state.displayData}
                    </Swiper>
                    <div id='loading-icon' className='loading'>
                        <ClipLoader size={35} color='black' loading={this.state.loading} />
                    </div>
                </div>
            );
        }
        return (
            <div id='loading-icon' className='loading'>
                <ClipLoader size={35} color='black' loading={this.state.loading} />
            </div>
        );
    }
}

export default Slider;