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
        const bottomElement = document.getElementById('bottom-element');
        if (this.mounted) {
            document.addEventListener('scroll', this.trackScrolling(bottomElement));
            var stateData = await this.getData();
            this.setState(stateData);
        }
    }

    componentWillUnmount() {
        const bottomElement = document.getElementById('bottom-element');
        document.removeEventListener('scroll', this.trackScrolling(bottomElement));
    }

    async getData() {
        this.setState({ loading: true });

        var startIndex = this.state.currentOffset - this.state.storiesToLoad;

        const topStoriesResult = await fetch(`${this.hnBaseUrl}topstories.json`);
        const topStoriesJson = await topStoriesResult.json();
        const currentStoriesSlice = topStoriesJson.slice(startIndex, this.state.currentOffset);

        var storyDataArray = await Promise.all(currentStoriesSlice.map(async (x) => {
            var storyResponse = await fetch(`${this.hnBaseUrl}item/${x}.json`);
            var story = await storyResponse.json();
            if (story.kids) {
                var topComments = await Promise.all(story.kids.slice(0, 10).map(async comment => {
                    var result = await fetch(`${this.hnBaseUrl}item/${comment}.json`);
                    return await result.json();
                }));
            }

            return { story: story, topComments: topComments }

        }));

        var currentDataArray = Object.assign([], this.state.storyData);

        currentDataArray.push(...storyDataArray);

        var newOffset = this.state.currentOffset + this.state.storiesToLoad;

        return ({
            storyData: currentDataArray,
            currentOffset: newOffset,
            loading: false
        });
    }

    createHackerCards() {
        if (this.state.storyData !== undefined) {
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
                    <HackerCard {...hackerCardProps} />
                );
            });
        }
        return hackerCardData;
    }

    trackScrolling = async (wrappedElement) => {
        if (this.isBottom(wrappedElement)) {
            if (!this.state.loading) {
                await this.getData();
            }
        }
    };

    isBottom(el) {
        return el.getBoundingClientRect().bottom <= (window.innerHeight + 1);
    }

    render() {
        var hackerCards = this.createHackerCards();

        if (hackerCards !== undefined) {
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