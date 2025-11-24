import { NextRequest, NextResponse } from 'next/server';

interface GitHubCommit {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      email: string;
      date: string;
    };
  };
  author: {
    login: string;
    avatar_url: string;
  } | null;
  html_url: string;
}

interface CommitActivity {
  id: string;
  message: string;
  author: string;
  authorAvatar?: string;
  timestamp: number;
  url: string;
  sha: string;
}

export async function GET(request: NextRequest) {
  try {
    // Default to ainexsuite/ainexsuite if not configured
    const repo = process.env.GITHUB_REPO || 'ainexsuite/ainexsuite';
    const token = process.env.GITHUB_TOKEN;

    console.log('Fetching commits for repo:', repo);

    // Parse repo format: owner/repo or full URL
    let owner: string;
    let repoName: string;

    if (repo.includes('github.com')) {
      // Full URL format: https://github.com/owner/repo
      const match = repo.match(/github\.com\/([^\/]+)\/([^\/]+)/);
      if (!match) {
        return NextResponse.json(
          { error: 'Invalid GITHUB_REPO format. Use owner/repo or https://github.com/owner/repo' },
          { status: 400 }
        );
      }
      owner = match[1];
      repoName = match[2].replace(/\.git$/, '');
    } else {
      // owner/repo format
      const parts = repo.split('/');
      if (parts.length !== 2) {
        return NextResponse.json(
          { error: 'Invalid GITHUB_REPO format. Use owner/repo or https://github.com/owner/repo' },
          { status: 400 }
        );
      }
      owner = parts[0];
      repoName = parts[1];
    }

    const url = `https://api.github.com/repos/${owner}/${repoName}/commits?sha=main&per_page=20&page=1`;
    
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'AINexSuite-Admin',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    console.log('Fetching from URL:', url);
    const response = await fetch(url, { headers });
    console.log('Response status:', response.status, response.statusText);

    if (!response.ok) {
      let errorMessage = `GitHub API error: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        const errorText = await response.text();
        errorMessage = errorText || errorMessage;
      }
      
      console.error('GitHub API error:', {
        status: response.status,
        statusText: response.statusText,
        url,
        error: errorMessage
      });
      
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }

    const commits: GitHubCommit[] = await response.json();

    const activities: CommitActivity[] = commits.map((commit) => ({
      id: commit.sha,
      message: commit.commit.message.split('\n')[0], // First line only
      author: commit.author?.login || commit.commit.author.name,
      authorAvatar: commit.author?.avatar_url,
      timestamp: new Date(commit.commit.author.date).getTime(),
      url: commit.html_url,
      sha: commit.sha.substring(0, 7),
    }));

    return NextResponse.json({ activities });
  } catch (error) {
    console.error('Error fetching GitHub commits:', error);
    return NextResponse.json(
      { error: 'Failed to fetch GitHub commits' },
      { status: 500 }
    );
  }
}
