interface HttpRequest {
  headers: {
      [key: string]: string;
  };
  body: any;
  params: {
      [key: string]: string;
  };
  query: {
      [key: string]: string;
  };
}

interface HttpResponse {
  statusCode: number;
  body: any;
}

export {
  HttpRequest,
  HttpResponse
};

