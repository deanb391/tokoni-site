// app/api/posts/feed/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getGlobalFeedPostsService } from "@/lib/services/posts.service";
import { getUserProfileService } from "@/lib/services/users.service";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "feed"; // "feed" | "reels"
    const userId = searchParams.get("userId") || undefined;
    const keywordsParam = searchParams.get("keywords") || "";
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    // Extract keywords list
    const keywords = keywordsParam
      .split(",")
      .map(k => k.trim().toLowerCase())
      .filter(Boolean);

    // Fetch candidate posts (pool size 100)
    const { posts } = await getGlobalFeedPostsService(100);

    // Fetch user following list if logged in
    let following: string[] = [];
    if (userId) {
      const profile = await getUserProfileService(userId);
      if (profile && profile.following) {
        following = profile.following;
      }
    }

    // Score posts
    const scoredPosts = posts.map(post => {
      let score = 0;

      // --- LEVEL 1 PRE-CALCULATIONS ---
      // Keyword matching count
      let keywordMatches = 0;
      const captionLower = (post.caption || "").toLowerCase();
      keywords.forEach(kw => {
        if (captionLower.includes(kw)) {
          keywordMatches++;
        }
      });

      const isFollowed = following.includes(post.vendor);

      // Nonlinear views scaling: returns 0 to 1
      const viewsVal = post.views || 0;
      const viewsScore = viewsVal / (viewsVal + 100);

      // Nonlinear likes scaling
      const likesVal = post.likes || 0;
      const likesScore = likesVal / (likesVal + 50);

      // Nonlinear other metrics scaling
      const commentsVal = post.comments || 0;
      const commentsScore = commentsVal / (commentsVal + 10);

      const sharesVal = post.shares || 0;
      const sharesScore = sharesVal / (sharesVal + 10);

      const savedVal = post.saved || 0;
      const savedScore = savedVal / (savedVal + 10);

      // Recency calculation: decays over 7 days
      const ageInDays = (Date.now() - new Date(post.$createdAt).getTime()) / (1000 * 60 * 60 * 24);
      const recencyScore = Math.exp(-Math.max(0, ageInDays) / 7);

      if (type === "reels") {
        // --- REELS FEED ALGORITHM ---
        // Level 1: Views, Keywords (Weight = 1000)
        score += 1000 * viewsScore;
        score += 1000 * keywordMatches;

        // Level 2: Following, New Content, Likes (Weight = 100)
        score += 100 * (isFollowed ? 1 : 0);
        score += 100 * recencyScore;
        score += 100 * likesScore;

        // Level 3: Comments, Shares, Saves (Weight = 10)
        score += 10 * commentsScore;
        score += 10 * sharesScore;
        score += 10 * savedScore;
      } else {
        // --- STANDARD FEED ALGORITHM ---
        // Level 1: Keywords, Following (Weight = 1000)
        score += 1000 * keywordMatches;
        score += 1000 * (isFollowed ? 1 : 0);

        // Level 2: Views, New Content, Likes (Weight = 100)
        score += 100 * viewsScore;
        score += 100 * recencyScore;
        score += 100 * likesScore;

        // Level 3: Comments, Shares, Saves (Weight = 10)
        score += 10 * commentsScore;
        score += 10 * sharesScore;
        score += 10 * savedScore;
      }

      return { post, score };
    });

    // Sort descending by score
    scoredPosts.sort((a, b) => b.score - a.score);

    // Paginate
    const paginated = scoredPosts.slice(offset, offset + limit).map(sp => sp.post);
    const hasMore = offset + limit < scoredPosts.length;

    return NextResponse.json(
      {
        success: true,
        posts: paginated,
        hasMore,
        nextOffset: hasMore ? offset + limit : null,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("GET RANKED FEED API ROUTE ERROR:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch ranked feed" },
      { status: 500 }
    );
  }
}
