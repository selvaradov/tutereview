import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import axios from 'axios';
import { Form, Row, Col, Spinner } from 'react-bootstrap';
import Select, { ActionMeta, MultiValue } from 'react-select';
import PageLayout from './PageLayout';
import './SearchPage.css';

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
  submittedAt: string;
  college: string;
}

interface SearchParams {
  tutor: string;
  subject: string;
  paper: string[];
  college: string[];
}

interface SelectOption {
  value: string;
  label: string;
}

const baseURL = process.env.REACT_APP_API_URL;

const SearchPage: React.FC = () => {
  const [subjects, setSubjects] = useState<SubjectsData>({});
  const [selectedSubject, setSelectedSubject] = useState<SelectOption | null>(null);
  const [papers, setPapers] = useState<Paper[]>([]);
  const [colleges, setColleges] = useState<SelectOption[]>([]);
  const [searchParams, setSearchParams] = useState<SearchParams>({
    tutor: '',
    subject: '',
    paper: [],
    college: []
  });
  const [results, setResults] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const latestSearchParams = useRef(searchParams);
  const [isSearchPending, setIsSearchPending] = useState(false);

  const subjectOptions: SelectOption[] = Object.keys(subjects).map(subjectName => ({
    value: subjectName,
    label: subjectName
  }));

  const paperOptions: SelectOption[] = papers.map(paper => ({
    value: paper.code.toString(),
    label: `${paper.code} - ${paper.name}`
  }));

  const memoizedCollegeOptions = useMemo(() =>
    searchParams.college.map(value => colleges.find(c => c.value === value)).filter(Boolean) as SelectOption[],
    [searchParams.college, colleges]
  );

  const memoizedPaperOptions = useMemo(() =>
    searchParams.paper.map(value => paperOptions.find(p => p.value === value)).filter(Boolean) as SelectOption[],
    [searchParams.paper, paperOptions]
  );

  const collegeLookup = useMemo(() => {
    return new Map(colleges.map(college => [college.value, college.label]));
  }, [colleges]);

  const areSearchParamsEmpty = (params: SearchParams): boolean => {
    const { tutor, subject, paper, college } = params;
    return tutor === '' && subject === '' && paper.length === 0 && college.length === 0;
  };

  useEffect(() => {
    document.title = 'TuteReview - Search reviews';
    fetchSubjects();
    fetchColleges();
  }, []);

  // Hide scrollbar when loading
  useEffect(() => {
    if (isLoading || isSearchPending) {
      // Save original styles
      const originalStyle = {
        scrollbarGutter: document.documentElement.style.getPropertyValue('scrollbar-gutter'),
        overflow: document.documentElement.style.getPropertyValue('overflow'),
      };
      // Apply new styles
      document.documentElement.style.setProperty('scrollbar-gutter', 'unset');
      document.documentElement.style.setProperty('overflow', 'hidden');
      document.body.style.setProperty('padding-right', `0px`);
      return () => {
        // Restore original styles when component unmounts or loading state changes
        document.documentElement.style.setProperty('scrollbar-gutter', originalStyle.scrollbarGutter);
        document.documentElement.style.setProperty('overflow', originalStyle.overflow);
        document.body.style.removeProperty('padding-right');
      };
    }
  }, [isLoading, isSearchPending]);

  const fetchResults = useCallback(async () => { // NOTE unecessarily fetches on initial load
    if (areSearchParamsEmpty(latestSearchParams.current)) {
      setResults([]);
      setIsLoading(false);
      setIsSearchPending(false);
      return;
    }
    setIsLoading(true);
    try {
      const response = await axios.get<Review[]>(`${baseURL}/api/search`, {
        params: latestSearchParams.current,
        withCredentials: true,
      });
      setResults(response.data);
    } catch (error) {
      console.error('Error searching reviews:', error);
    } finally {
      setIsLoading(false);
      setIsSearchPending(false);
    }
  }, []);

  useEffect(() => {
    latestSearchParams.current = searchParams;
    setIsSearchPending(true);

    const debounceTimer = setTimeout(() => {
      fetchResults();
    }, 300);

    return () => {
      clearTimeout(debounceTimer);
      setIsSearchPending(false);
    };
  }, [searchParams, fetchResults]);

  const fetchSubjects = async () => {
    try {
      const response = await axios.get<SubjectsData>(`${baseURL}/api/subjects`, { withCredentials: true });
      setSubjects(response.data);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const fetchColleges = async () => {
    try {
      const response = await axios.get<SelectOption[]>(`${baseURL}/api/colleges`, { withCredentials: true });
      setColleges(response.data);
    } catch (error) {
      console.error('Error fetching colleges:', error);
    }
  };

  const handleSubjectChange = (selectedOption: SelectOption | null) => {
    setSelectedSubject(selectedOption);
    if (selectedOption) {
      setPapers(subjects[selectedOption.value] || []);
      setSearchParams(prev => ({ ...prev, subject: selectedOption.value, paper: [] }));
    } else {
      setPapers([]);
      setSearchParams(prev => ({ ...prev, subject: '', paper: [] }));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({ ...prev, [name]: value }));
  };

  const handlePaperChange = (
    selectedOptions: MultiValue<SelectOption> | null,
    actionMeta: ActionMeta<SelectOption>
  ) => {
    setSearchParams(prev => ({
      ...prev,
      // Map over selectedOptions only if it's not null, otherwise set to an empty array
      paper: selectedOptions ? selectedOptions.map(option => option.value) : []
    }));
  };

  const handleCollegeChange = (
    selectedOptions: MultiValue<SelectOption> | null,
    actionMeta: ActionMeta<SelectOption>
  ) => {
    setSearchParams(prev => ({
      ...prev,
      college: selectedOptions ? selectedOptions.map(option => option.value) : []
    }));
  };

  return (
    <PageLayout title="Search reviews">
      <Form>
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group controlId="tutor">
              <Form.Label className='fw-bold'>Tutor's name:</Form.Label>
              <Form.Control
                type="text"
                name="tutor"
                value={searchParams.tutor}
                onChange={handleInputChange}
                placeholder="Start typing..."
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="college">
              <Form.Label className='fw-bold'>College:</Form.Label>
              <Select<SelectOption, true>
                value={memoizedCollegeOptions}
                onChange={handleCollegeChange}
                options={colleges}
                isClearable
                isMulti
                placeholder="Select colleges"
              />
            </Form.Group>
          </Col>
          </Row>
          <Row className="mb-3">
          <Col md={6}>
            <Form.Group controlId="subject">
              <Form.Label className='fw-bold'>Subject:</Form.Label>
              <Select<SelectOption>
                value={selectedSubject}
                onChange={handleSubjectChange}
                options={subjectOptions}
                isClearable
                placeholder="Select a subject"
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="paper">
              <Form.Label className='fw-bold'>Paper:</Form.Label>
              <Select<SelectOption, true>
                value={memoizedPaperOptions}
                onChange={handlePaperChange}
                options={paperOptions}
                isClearable
                isDisabled={!selectedSubject}
                placeholder={selectedSubject ? "Select papers" : "Choose subject first"}
                isMulti
              />
            </Form.Group>
          </Col>
        </Row>
      </Form>

      <div id="results" className="mt-4">
        {areSearchParamsEmpty(searchParams) ? (
          <p>Please select some filters to search.</p>
        ) : results.length === 0 && !isLoading && !isSearchPending ? (
          <p>No results found.</p>
        ) : (
          <>
            {results.map((review, index) => (
              <div key={index} className="review-entry mb-4">
                <h3>{`${review.responses.paperName} (${review.responses.paperCode}) - ${review.responses.tutor}`}</h3>
                <p><em>College: {collegeLookup.get(review.college) || review.college}</em></p>
                {review.submittedAt && (
                  <p><em>Submitted: {new Date(review.submittedAt).toLocaleDateString("en-GB", { year: 'numeric', month: 'long', day: 'numeric' })}</em></p>
                )}
                {Object.entries(review.responses).map(([key, value]) => {
                  if (!['tutor', 'subject', 'paperCode', 'paper', 'paperName', 'submittedAt'].includes(key) && value.trim() !== "") {
                    return (
                      <p key={key}>
                        <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {value}
                      </p>
                    );
                  }
                  return null;
                })}
              </div>
            ))}
            {(isLoading || isSearchPending) && (
              <div className="loading-overlay">
                <Spinner animation="border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
              </div>
            )}
          </>
        )}
      </div>
    </PageLayout>
  );
};

export default SearchPage;