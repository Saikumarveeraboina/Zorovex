import axios from 'axios';

export const fetchGitHubRepos = async (username) => {
  const response = await axios.get(
    `https://api.github.com/users/${username}/repos?sort=stars&per_page=6`,
    {
      headers: {
        Accept: 'application/vnd.github.v3+json',
      },
    }
  );

  return response.data.map((repo) => ({
    name: repo.name,
    description: repo.description || '',
    link: repo.html_url,
    stars: repo.stargazers_count,
    language: repo.language || 'N/A',
  }));
};
