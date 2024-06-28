import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

interface Paper {
  code: number;
  name: string;
  level: string;
}

interface SubjectsData {
  [key: string]: Paper[];
}

interface Review {
  responses: {
    tutor: string;
    subject: string;
    paperCode: string;
    paperName: string;
    [key: string]: string;
  };
  submittedAt?: string;
}

const SearchPage: React.FC = () => {
  const { logout, checkAuthStatus } = useAuth();
  const [subjects, setSubjects] = useState<SubjectsData>({});
  const [selectedSubject, setSelectedSubject] = useState('');
  const [papers, setPapers] = useState<Paper[]>([]);
  const [searchParams, setSearchParams] = useState({
    tutor: '',
    subject: '',
    paper: '',
  });
  const [results, setResults] = useState<Review[]>([]);

  useEffect(() => {
    checkAuthStatus();
    fetchSubjects();
  }, [checkAuthStatus]);

  const fetchSubjects = async () => {
    try {
      const response = await axios.get<SubjectsData>(`${process.env.REACT_APP_API_URL}/api/subjects`,
        { withCredentials: true }
      );
      setSubjects(response.data);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const handleSubjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const subject = e.target.value;
    setSelectedSubject(subject);
    setPapers(subjects[subject] || []);
    setSearchParams(prev => ({ ...prev, subject, paper: '' }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await axios.get<Review[]>(`${process.env.REACT_APP_API_URL}/api/search`,
        {
          params: searchParams,
          withCredentials: true
        });
      setResults(response.data);
    } catch (error) {
      console.error('Error searching reviews:', error);
    }
  };

  return (
    <div>
      <h1>Search Reviews</h1>
      <form onSubmit={handleSearch}>
        <label htmlFor="tutor">Tutor's Name:</label>
        <input
          type="text"
          id="tutor"
          name="tutor"
          value={searchParams.tutor}
          onChange={handleInputChange}
          placeholder="Tutor's Name"
        />

        <label htmlFor="subject">Subject:</label>
        <select
          id="subject"
          name="subject"
          value={selectedSubject}
          onChange={handleSubjectChange}
        >
          <option value="">Select a subject</option>
          {Object.keys(subjects).map(subjectName => (
            <option key={subjectName} value={subjectName}>
              {subjectName}
            </option>
          ))}
        </select>

        <label htmlFor="paper">Paper:</label>
        <select
          id="paper"
          name="paper"
          value={searchParams.paper}
          onChange={handleInputChange}
        >
          <option value="">Select a paper</option>
          {papers.map(paper => (
            <option key={paper.code} value={paper.code.toString()}>
              {`${paper.code} - ${paper.name}`}
            </option>
          ))}
        </select>

        <button type="submit">Search</button>
      </form>

      <div id="results">
        {results.length === 0 ? (
          <p>No results found.</p>
        ) : (
          results.map((review, index) => (
            <div key={index} className="review-entry">
              <h3>{`${review.responses.paperName} (${review.responses.paperCode}) - ${review.responses.tutor}`}</h3>
              {review.submittedAt && (
                <p><em>Submitted: {new Date(review.submittedAt).toLocaleDateString("en-GB", { year: 'numeric', month: 'long', day: 'numeric' })}</em></p>
              )}
              {Object.entries(review.responses).map(([key, value]) => {
                if (!['tutor', 'subject', 'paperCode', 'paperName', 'submittedAt'].includes(key) && value.trim() !== "") {
                  return (
                    <p key={key}>
                      <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {value}
                    </p>
                  );
                }
                return null;
              })}
            </div>
          ))
        )}
      </div>

      <button onClick={logout}>Log Out</button>
    </div>
  );
};

export default SearchPage;