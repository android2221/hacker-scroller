import React, { Component } from "react";
import ClipLoader from "react-spinners/ClipLoader";
import HackerCard from "../HackerCard/HackerCard";
import './Scroller.scss';

class Scroller extends Component {
    constructor() {
        super();
        this.state = {
            topStories: [],
            storyData: [],
            currentStoriesSlice: [],
            currentOffset: 10,
            storiesToLoad: 10,
            loading: true,
        }
        this.mounted = false;
        this.hnBaseUrl = 'https://hacker-news.firebaseio.com/v0/';
    }

    async componentDidMount() {
        this.mounted = true;
        if (this.mounted) {
            var stateData = await this.getData();
            this.setState(stateData);
            document.addEventListener('scroll', this.trackScrolling);
        }
    }

    componentWillUnmount() {
        document.removeEventListener('scroll', this.trackScrolling);
    }

    async getData() {
        if (this.state.loading !== true) {
            this.setState({ loading: true });
        }

        var startIndex = this.state.currentOffset - this.state.storiesToLoad;

        // pack current state into object, or get new info and work from here
        var workingStateObject = {};

        if (this.state.topStories.length === 0) {
            const topStoriesResult = await fetch(`${this.hnBaseUrl}topstories.json`);
            const topStoriesJson = await topStoriesResult.json();
            const currentStoriesSlice = topStoriesJson.slice(startIndex, this.state.currentOffset);
            workingStateObject.topStories = topStoriesJson;
            workingStateObject.currentStoriesSlice = currentStoriesSlice;
        } else {
            workingStateObject.topStories = this.state.topStories;
            workingStateObject.currentStoriesSlice = workingStateObject.topStories.slice(startIndex, this.state.currentOffset)
        }

        var topComments = [];

        var storyDataArray = await Promise.all(workingStateObject.currentStoriesSlice.map(async (x) => {
            var storyResponse = await fetch(`${this.hnBaseUrl}item/${x}.json`);
            var story = await storyResponse.json();
            if (story.kids) {
                topComments = await Promise.all(story.kids.slice(0, 10).map(async comment => {
                    var result = await fetch(`${this.hnBaseUrl}item/${comment}.json`);
                    return await result.json();
                }));
            }

            // remove deleted comments
            var editedComments = [];
            if (topComments.length > 0) {
                topComments.forEach(x => {
                    if (x === null || x === undefined || ('deleted' in x && x.deleted === true)) {
                        return;
                    }
                    editedComments.push(x);
                });
            }

            return { story: story, topComments: editedComments }

        }));

        // create new story data array, tack data on to the end of it
        var currentDataArray = Object.assign([], this.state.storyData);
        currentDataArray.push(...storyDataArray);

        // calculate new offset
        var newOffset = this.state.currentOffset + this.state.storiesToLoad;

        return ({
            topStories: workingStateObject.topStories,
            currentStoriesSlice: workingStateObject.currentStoriesSlice,
            storyData: currentDataArray,
            currentOffset: newOffset,
            loading: false
        });
    }

    createHackerCards() {
        if (this.state.storyData !== undefined && this.state.storyData.length > 0) {
            var hackerCardData = this.state.storyData.map((x, index) => {
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
                    calculatedUrl = hnUrl;
                }

                var hackerCardProps = {
                    story: story,
                    calculatedUrl: calculatedUrl,
                    displayUrl: displayUrl,
                    hnUrl: hnUrl,
                    storyKey: index,
                    topComments: topComments
                };

                return (
                    <HackerCard key={index} {...hackerCardProps} />
                );
            });
        }
        return hackerCardData;
    }

    trackScrolling = async () => {
        var wrappedElement = document.getElementById('bottom-element');
        if (this.isBottom(wrappedElement)) {
            if (!this.state.loading) {
                var stateData = await this.getData();
                this.setState(stateData);
            }
        }
    };

    isBottom(el) {
        return el.getBoundingClientRect().bottom <= (window.innerHeight + 1);
    }

    render() {
        var hackerCards = this.createHackerCards();

        if (hackerCards !== undefined && hackerCards.length > 0) {
            return (
                <div className='scroller-container'>
                    {hackerCards}
                    <div id="bottom-element"></div>
                    <div id='loading-icon-container'>
                        <div id='loading-icon' className="loading">
                            <ClipLoader size={35} color='black' loading={this.state.loading} />
                        </div>
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

export default Scroller;