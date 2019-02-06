## Inspiration

My 3 year old son wanted Alexa to tell him how to count to ten in another language. But she couldn't do it. I knew about this skill challenge, so I figured I'd give it a go.

## What it does

County can show you how to count to ten in a variety of languages. On devices with screens, it shows touchable flags and shows the numbers and written-out text for each number as it counts.

It's not quite through the skill certification process, but the skill ID is `amzn1.ask.skill.e220ac20-8c57-49ee-8657-fb33da45b6d9`.

## How I built it

I used the Alexa Skills Kit for Node and AWS Lambda to build the skill. I built a set of APL documents and used commands like `SpeakItem`, `SendEvent`, and `SetPage` to manage the user interaction and counting actions.

## Challenges I ran into

When I was most of the way through building the skill, I ran into a bug in the Alexa service. When assembling a `Sequential` command set that would run `SetPage` and `SpeakItem` commands to read each number, I found that Alexa would read the first number and then stop.

I searched the forums, and [found another person who had hit a similar problem](https://forums.developer.amazon.com/questions/194676/sequential-command-not-functioning-properly.html). I provided code and details of my issue and, after plenty of troubleshooting, determined that it was caused by two separate bugs in Alexa. An Amazon rep [filed the two bugs](https://forums.developer.amazon.com/answers/195584/view.html) and promised (also via email) that he'd try to get them fixed before the hackathon deadline.

Unfortunately, I didn't hear back after that, but I was surprised when today (a few weeks after filing), the behavior is now fixed (at least in the simulator). So I put the finishing touches on the skill and submitted for certification.

## Accomplishments that I'm proud of

I'm proud of building a full multi-modal skill. I was able to learn APL and SSML, and get a much clearer idea of how the Alexa interaction model works.

## What I learned

As I mentioned before, I was excited to learn about APL and SSML. It was also fun to learn some of the AWS CLI functions so I could setup deployment scripts in my project rather than manually uploading through the Lambda portal.

## What's next for County

Once approved, I'll likely spend some time adding more languages (Italian is next). I'd also like to give it a spit-shine on Echo Spot devices.
