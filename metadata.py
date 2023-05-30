import os
import re
import requests
from bs4 import BeautifulSoup
from PIL import Image
from io import BytesIO
from loguru import logger
import json

library_path = '/Volumes/TOSHIBA EXT/Movies'
metadata = []


def clean_title(title):
    # clean titles like this Bruiser.2022.LIGHTDLMOVIES.mkv to Bruiser and if year is present extract year too
    title = title.replace('.', ' ')
    title = title.replace('_', ' ')
    title = title.replace('-', ' ')
    title = title.replace('(', ' ')
    title = title.replace(')', ' ')
    title = title.replace('[', ' ')
    title = title.replace(']', ' ')
    title = title.replace('{', ' ')
    title = title.replace('}', ' ')
    # extract year from title
    year = re.findall(r'\d{4}', title)
    if year:
        year = year[0]
        # split by year and take first part
        titles = title.split(year)
        title = titles[0]
    else:
        year = None

    return title, year


def get_metadata(filepath):
    # Extract metadata from file name
    filename = os.path.basename(filepath)
    logger.info(f'Processing file: {filename}')

    title = filename
    title, year = clean_title(title)
    logger.info(f'Cleaned title: {title}')
    logger.info(f'Year: {year}')

    # Search for plot summary and cover art using the OMDB API
    api_key = '8e4de813'
    url = f'http://www.omdbapi.com/?t={title}&plot=full&apikey={api_key}&type=movie'

    # if year add year
    if year:
        url = f'http://www.omdbapi.com/?t={title}&y={year}&plot=full&apikey={api_key}&type=movie'

    try:
        logger.debug(url)
        response = requests.get(url)
    except Exception as exc:
        logger.error(exc)
        logger.info('Skipping file')
        return None

    if response.status_code != 200:
        logger.error(
            f'Failed to get metadata from OMDB API: {response.status_code}')
        return None

    data = response.json()

    if data['Response'] == 'False':
        return None

    # Extract relevant metadata
    metadata = {
        'title': data['Title'],
        'year': data['Year'],
        'genre': data['Genre'],
        'plot': data['Plot'],
        'poster': data['Poster'],
        'filename': filename,
        'filepath': filepath
    }

    logger.info(f'Found metadata: {metadata}')

    # Download cover art and resize it to a thumbnail
    try:
        if metadata['poster'] != 'N/A':
            response = requests.get(metadata['poster'])
            img = Image.open(BytesIO(response.content))
            img.thumbnail((200, 200))
            metadata['thumbnail'] = img.tobytes().decode('utf-8')
            logger.info('Downloaded cover art and resized it to a thumbnail')
    except Exception as exc:
        logger.error(exc)
        logger.info('Failed to download cover art')
        logger.info('Skipping file')

    return metadata


logger.info('Starting metadata extraction')
for root, dirs, files in os.walk(library_path):
    for file in files:
        if file.endswith(('mp4', 'mkv', 'avi', 'wmv', 'mov')):
            filepath = os.path.join(root, file)
            file_metadata = get_metadata(filepath)
            if file_metadata != None:
                metadata.append(file_metadata)

                # write metadata to json file at every turn
                logger.info('Writing metadata to json file')
                json_metadata = json.dumps(metadata, indent=4)
                with open('metadata.json', 'w') as outfile:
                    outfile.write(json_metadata)

logger.info(metadata)
json_metadata = json.dumps(metadata, indent=4)
with open('metadata.json', 'w') as outfile:
    outfile.write(json_metadata)
