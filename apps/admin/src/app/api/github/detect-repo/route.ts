import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function GET() {
  try {
    // Try to get git remote URL
    const { stdout } = await execAsync('git config --get remote.origin.url', {
      cwd: process.cwd(),
    });

    const url = stdout.trim();
    
    if (!url) {
      return NextResponse.json({ repo: null });
    }

    // Parse GitHub URL
    // Formats: https://github.com/owner/repo.git
    //          git@github.com:owner/repo.git
    //          https://github.com/owner/repo
    const match = url.match(/github\.com[/:]([^/]+)\/([^/]+?)(?:\.git)?$/);
    
    if (match) {
      const owner = match[1];
      const repo = match[2];
      return NextResponse.json({ 
        repo: `${owner}/${repo}`,
        url: `https://github.com/${owner}/${repo}`
      });
    }

    return NextResponse.json({ repo: null });
  } catch (error) {
    // Git command failed or not in a git repo
    return NextResponse.json({ repo: null });
  }
}
