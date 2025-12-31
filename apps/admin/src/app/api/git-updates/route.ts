import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function GET() {
  try {
    // Try to find the git root
    // This ensures we can run git commands even if the process CWD is deep in the structure
    // Note: This requires the server to have 'git' installed and access to the .git directory
    // This typically works in local development or self-hosted instances, but may fail in 
    // serverless environments like Vercel unless explicitly configured (which is rare).
    const { stdout: rootPath } = await execAsync('git rev-parse --show-toplevel');
    const cwd = rootPath.trim();

    const { stdout } = await execAsync(
      'git log -n 50 --pretty=format:"%H|%s|%ad|%an" --date=iso',
      { cwd }
    );

    const commits = stdout.split('\n')
      .filter(Boolean)
      .map(line => {
        const parts = line.split('|');
        if (parts.length < 4) return null;
        
        const [hash, message, date, author] = parts;
        
        // Simple heuristic to determine type based on conventional commits or keywords
        let type = 'improvement';
        const lowerMsg = message.toLowerCase();
        
        if (lowerMsg.startsWith('feat') || lowerMsg.includes('feat:') || lowerMsg.includes('feature')) {
            type = 'feature';
        } else if (lowerMsg.startsWith('fix') || lowerMsg.includes('fix:') || lowerMsg.includes('bug')) {
            type = 'fix';
        } else if (lowerMsg.startsWith('chore') || lowerMsg.includes('chore:') || lowerMsg.includes('refactor')) {
            type = 'improvement';
        } else if (lowerMsg.startsWith('docs') || lowerMsg.includes('docs:')) {
            type = 'improvement';
        } else if (lowerMsg.includes('announce') || lowerMsg.includes('release') || lowerMsg.includes('version')) {
            type = 'announcement';
        }

        // Cleanup message - remove type prefix if present (e.g., "feat: new thing" -> "new thing")
        // This makes the UI cleaner
        let cleanMessage = message;
        if (message.includes(':')) {
            const split = message.split(':');
            if (split[0].length < 15) { // heuristics to avoid splitting normal sentences
                cleanMessage = split.slice(1).join(':').trim();
            }
        }

        return {
          id: hash,
          originalMessage: message,
          title: cleanMessage,
          date,
          author,
          type
        };
      })
      .filter(Boolean);

    return NextResponse.json({ commits });
  } catch (error) {
    console.error('Error fetching git logs:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch git logs. This feature is intended for local development usage.',
      details: String(error)
    }, { status: 500 });
  }
}
