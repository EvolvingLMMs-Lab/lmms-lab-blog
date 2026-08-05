This is a deliberately small sample post. It exercises the main pieces of the
publishing pipeline without trying to tell a complete research story.

## Markdown basics

Markdown gives us **strong text**, *emphasis*, [links](https://www.lmms-lab.com/),
and `inline code` in an ordinary paragraph.

> A useful blog should make the idea easy to inspect, reproduce, and discuss.

The same source can also express structured content:

1. Write the post in Markdown.
2. Add metadata for the title, date, and description.
3. Run the generator and let Angular prerender the result.

| Modality | Example representation |
| --- | --- |
| Image | spatial tokens |
| Video | temporally ordered visual tokens |
| Audio | acoustic features |
| Text | language tokens |

Code fences are highlighted and get a copy button:

```python
def fuse_modalities(*representations):
    """A tiny placeholder for a multimodal fusion module."""
    return sum(representations) / len(representations)
```

## Mathematics

Inline mathematics works inside a sentence, such as the temperature-scaled
softmax $p_i = \exp(z_i / \tau) / \sum_j \exp(z_j / \tau)$.

Display equations can use standard LaTeX notation:

$$
\mathbf{h}_{\mathrm{joint}}
= f_\theta\!\left(
  \mathbf{x}_{\mathrm{image}},
  \mathbf{x}_{\mathrm{video}},
  \mathbf{x}_{\mathrm{audio}},
  \mathbf{x}_{\mathrm{text}}
\right)
$$

For a classifier on top of that representation,

$$
p(y = k \mid \mathbf{h}_{\mathrm{joint}})
= \frac{\exp(\mathbf{w}_k^\top \mathbf{h}_{\mathrm{joint}})}
{\sum_j \exp(\mathbf{w}_j^\top \mathbf{h}_{\mathrm{joint}})}.
$$

## Local images

Images live beside the post under a slug-specific asset directory. The build
rewrites this relative path for production and preserves its intrinsic size.

![Abstract multimodal inputs merging into a shared representation.](./multimodal-flow.avif)

*A generated sample illustration used to verify local image publishing and zoom.*

## Local video

Articles can keep video sources and their poster beside the post. JavaScript enhances
this semantic element with the blog player, while native controls remain the fallback.

<figure class="media-figure">
  <video
    controls
    muted
    playsinline
    preload="metadata"
    width="960"
    height="540"
    poster="./flower-poster.avif"
    aria-label="Time-lapse of a flower blooming"
  >
    <source src="./flower.m3u8" type="application/vnd.apple.mpegurl">
    <source src="./flower.webm" type='video/webm; codecs="vp8, vorbis"'>
    <source src="./flower.mp4" type='video/mp4; codecs="avc1.64001F, mp4a.40.2"'>
    Your browser does not support embedded video.
  </video>
  <figcaption>
    A short CC0 flower time-lapse from
    <a href="https://interactive-examples.mdn.mozilla.net/pages/tabbed/video.html">MDN's video example</a>.
  </figcaption>
</figure>
